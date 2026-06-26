import os
import uuid
import asyncio
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.core.database import get_db, async_session_factory
from app.api.deps import get_current_user, require_admin
from app.models.user import User, UserRole
from app.models.call import Call, CallStatus, ScriptCompliance
from app.schemas.call import CallResponse, CallListResponse
from app.services.whisper_service import transcribe_audio, get_progress as whisper_get_progress
from app.services.gpt_service import analyze_transcript
from app.services.websocket_service import manager as ws_manager
from app.core.config import settings
from datetime import datetime, timezone

router = APIRouter(prefix="/api/calls", tags=["calls"])

ALLOWED_AUDIO = {".mp3", ".wav", ".ogg", ".m4a", ".flac", ".webm"}


@router.post("/upload", response_model=CallResponse)
async def upload_call(
    file: UploadFile = File(...),
    manager_id: int = Form(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMIN and current_user.id != manager_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Можно загружать только свои звонки")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_AUDIO:
        raise HTTPException(status_code=400, detail=f"Неподдерживаемый формат: {ext}")

    file_id = str(uuid.uuid4())
    safe_name = f"{file_id}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_name)

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    call = Call(
        manager_id=manager_id,
        original_filename=file.filename,
        file_path=file_path,
        status=CallStatus.UPLOADED,
    )
    db.add(call)
    await db.commit()

    result = await db.execute(
        select(Call).options(selectinload(Call.manager)).where(Call.id == call.id)
    )
    call = result.scalar_one()

    asyncio.ensure_future(process_call(call.id))

    return _call_to_response(call)


@router.get("", response_model=CallListResponse)
async def list_calls(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
    manager_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Build count query without selectinload to avoid cartesian product
    count_query = select(func.count(Call.id))

    if current_user.role != UserRole.ADMIN:
        count_query = count_query.where(Call.manager_id == current_user.id)
    elif manager_id:
        count_query = count_query.where(Call.manager_id == manager_id)

    if status_filter:
        count_query = count_query.where(Call.status == CallStatus(status_filter))

    total = (await db.execute(count_query)).scalar()

    # Now fetch the actual data with selectinload
    data_query = select(Call).options(selectinload(Call.manager))

    if current_user.role != UserRole.ADMIN:
        data_query = data_query.where(Call.manager_id == current_user.id)
    elif manager_id:
        data_query = data_query.where(Call.manager_id == manager_id)

    if status_filter:
        data_query = data_query.where(Call.status == CallStatus(status_filter))

    data_query = data_query.order_by(desc(Call.created_at))
    data_query = data_query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(data_query)
    calls = result.scalars().all()

    return CallListResponse(items=[_call_to_response(c) for c in calls], total=total, page=page, page_size=page_size)


@router.get("/{call_id}", response_model=CallResponse)
async def get_call(call_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Call).options(selectinload(Call.manager)).where(Call.id == call_id))
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=404, detail="Звонок не найден")
    if current_user.role != UserRole.ADMIN and call.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа")
    return _call_to_response(call)


@router.get("/{call_id}/audio")
async def get_call_audio(
    call_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Serve the audio file for a call."""
    call = await db.get(Call, call_id)
    if not call or not call.file_path:
        raise HTTPException(status_code=404, detail="Аудиофайл не найден")
    if not os.path.exists(call.file_path):
        raise HTTPException(status_code=404, detail="Файл не найден на диске")
    from fastapi.responses import FileResponse
    return FileResponse(call.file_path, media_type="audio/mpeg", filename=call.original_filename)


@router.patch("/{call_id}/exclude-rating")
async def toggle_exclude_rating(
    call_id: int,
    exclude: bool,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    call = await db.get(Call, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Звонок не найден")
    call.exclude_from_rating = exclude
    await db.commit()
    return {"exclude_from_rating": exclude}


@router.delete("/{call_id}")
async def delete_call(call_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_admin)):
    result = await db.execute(select(Call).options(selectinload(Call.manager)).where(Call.id == call_id))
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=404, detail="Звонок не найден")
    if call.file_path and os.path.exists(call.file_path):
        os.remove(call.file_path)
    await db.delete(call)
    await db.commit()
    return {"ok": True}


async def _broadcast_progress(call_id: int, status: str, progress: int, stage: str = ""):
    """Send progress update via WebSocket."""
    try:
        await ws_manager.broadcast({
            "type": "call_progress",
            "call_id": call_id,
            "status": status,
            "progress": progress,
            "stage": stage,
        })
    except Exception:
        pass  # WS is best-effort


async def process_call(call_id: int):
    """Process a call: transcribe + analyze with progress updates."""
    from app.core.database import async_session_factory

    async with async_session_factory() as db:
        result = await db.execute(select(Call).where(Call.id == call_id))
        call = result.scalar_one_or_none()
        if not call:
            return

        try:
            # Stage 1: Loading model
            call.status = CallStatus.PROCESSING
            await db.commit()
            await _broadcast_progress(call_id, "processing", 0, "Загрузка модели large-v3 (~1.6 GB)...")

            import asyncio
            await asyncio.sleep(0.5)
            await _broadcast_progress(call_id, "processing", 2, "Модель загружена, начинаем транскрибацию...")
            await _broadcast_progress(call_id, "processing", 5, "Транскрибация large-v3 (~5 мин на минуту аудио)...")

            # Stage 2: Transcribe (runs in thread pool — non-blocking)
            # Start a background poller for real-time progress from whisper
            async def _poll_progress():
                last_progress = -1
                from app.core.database import async_session_factory as _session_factory
                while True:
                    progress = whisper_get_progress(call_id)
                    if progress != last_progress:
                        display_pct = max(5, progress)
                        # Broadcast via WS
                        await _broadcast_progress(
                            call_id, "processing",
                            display_pct,
                            f"Транскрибация large-v3... ({display_pct}%)" if progress > 0 else "Загрузка модели large-v3 (~3.1 GB)..."
                        )
                        # Persist to DB every change
                        try:
                            async with _session_factory() as pdb:
                                pcall = await pdb.get(Call, call_id)
                                if pcall:
                                    pcall.progress = display_pct
                                    await pdb.commit()
                        except Exception:
                            pass
                        last_progress = progress
                    if progress >= 95:
                        break
                    await asyncio.sleep(3)

            poll_task = asyncio.ensure_future(_poll_progress())
            transcription = await transcribe_audio(call.file_path, call_id=call_id)
            poll_task.cancel()
            call.transcript = transcription["text"]
            call.duration_seconds = transcription.get("duration")
            call.transcript_confidence = transcription.get("confidence")
            call.whisper_model = settings.WHISPER_MODEL_SIZE
            call.status = CallStatus.TRANSCRIBED
            await db.commit()

            duration_min = transcription.get("duration", 0) / 60
            await _broadcast_progress(call_id, "processing", 85, f"Расшифровка завершена ({duration_min:.1f} мин записи)")

            # Stage 3: Analyze with GPT
            await _broadcast_progress(call_id, "processing", 90, "Анализ GPT-4o-mini...")
            analysis = await analyze_transcript(call.transcript, db_factory=async_session_factory)

            call.analysis = analysis
            call.compliance_score = analysis.get("compliance", {}).get("score")
            compliance_level = analysis.get("compliance", {}).get("level", "non_compliant")
            if compliance_level in [e.value for e in ScriptCompliance]:
                call.script_compliance = ScriptCompliance(compliance_level)

            # Extract new-style metrics
            emotions = analysis.get("emotions") or {}
            call.talk_ratio = emotions.get("manager_speech_ratio") if isinstance(emotions, dict) else analysis.get("manager_speech_ratio")
            call.emotions = emotions
            call.keywords_found = analysis.get("keywords_found", [])

            # Store objection info in objections_handled (backwards compatible)
            obj_types = analysis.get("objection_types", [])
            call.objections_handled = {
                "count": analysis.get("objection_count", 0),
                "types": obj_types,
                "handled": analysis.get("objection_count", 0) > 0,
            }

            # Store call_type in DB column for filtering
            try:
                call.call_type = analysis.get("call_type", "acceleration")
            except Exception:
                pass

            call.status = CallStatus.ANALYZED
            call.processed_at = datetime.now(timezone.utc)
            await db.commit()

            await _broadcast_progress(call_id, "analyzed", 100, "Готово")

        except Exception as e:
            call.status = CallStatus.FAILED
            await db.commit()
            await _broadcast_progress(call_id, "failed", 0, "Ошибка обработки")
            raise e


def _call_to_response(call: Call) -> CallResponse:
    analysis = call.analysis or {}
    return CallResponse(
        id=call.id,
        manager_id=call.manager_id,
        manager_name=call.manager.username if call.manager else None,
        original_filename=call.original_filename,
        duration_seconds=call.duration_seconds,
        status=call.status.value if call.status else None,
        transcript=call.transcript,
        transcript_confidence=call.transcript_confidence,
        analysis=call.analysis,
        script_compliance=call.script_compliance.value if call.script_compliance else None,
        compliance_score=call.compliance_score,
        talk_ratio=call.talk_ratio,
        emotions=call.emotions,
        keywords_found=call.keywords_found,
        objections_handled=call.objections_handled,
        progress=call.progress,
        source=call.source,
        created_at=call.created_at,
        processed_at=call.processed_at,
        # New competitor-inspired fields from analysis JSON
        call_type=analysis.get("call_type") or getattr(call, "call_type", None),
        warmth=analysis.get("warmth"),
        fg_score=analysis.get("fg_score"),
        criteria_scores=analysis.get("criteria_scores"),
        objection_count=analysis.get("objection_count"),
        objection_types=analysis.get("objection_types"),
        manager_tone=analysis.get("manager_tone"),
        client_tone=analysis.get("client_tone"),
        strengths=analysis.get("strengths"),
        growth_areas=analysis.get("growth_areas"),
        exclude_from_rating=call.exclude_from_rating if hasattr(call, 'exclude_from_rating') else False,
        client_data=analysis.get("client_data"),
        conversation=analysis.get("conversation"),
    )
