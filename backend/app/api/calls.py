import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.core.database import get_db
from app.api.deps import get_current_user, require_admin
from app.models.user import User, UserRole
from app.models.call import Call, CallStatus, ScriptCompliance
from app.schemas.call import CallResponse, CallListResponse, CallUpdate
from app.services.whisper_service import transcribe_audio
from app.services.gpt_service import analyze_transcript
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
    # Admin can upload for anyone; managers only for themselves
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
    await db.refresh(call)

    # Запускаем обработку в фоне
    import asyncio
    asyncio.create_task(process_call(call.id))

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
    query = select(Call)

    if current_user.role != UserRole.ADMIN:
        query = query.where(Call.manager_id == current_user.id)
    elif manager_id:
        query = query.where(Call.manager_id == manager_id)

    if status_filter:
        query = query.where(Call.status == CallStatus(status_filter))

    query = query.order_by(desc(Call.created_at))

    total_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(total_q)).scalar()

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    calls = result.scalars().all()

    return CallListResponse(items=[_call_to_response(c) for c in calls], total=total, page=page, page_size=page_size)


@router.get("/{call_id}", response_model=CallResponse)
async def get_call(call_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Call).where(Call.id == call_id))
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=404, detail="Звонок не найден")
    if current_user.role != UserRole.ADMIN and call.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа")
    return _call_to_response(call)


@router.delete("/{call_id}")
async def delete_call(call_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_admin)):
    result = await db.execute(select(Call).where(Call.id == call_id))
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=404, detail="Звонок не найден")
    if call.file_path and os.path.exists(call.file_path):
        os.remove(call.file_path)
    await db.delete(call)
    await db.commit()
    return {"ok": True}


async def process_call(call_id: int):
    """Process a call: transcribe + analyze."""
    from app.core.database import async_session_factory

    async with async_session_factory() as db:
        result = await db.execute(select(Call).where(Call.id == call_id))
        call = result.scalar_one_or_none()
        if not call:
            return

        try:
            call.status = CallStatus.PROCESSING
            await db.commit()

            # 1. Transcribe
            transcription = await transcribe_audio(call.file_path)
            call.transcript = transcription["text"]
            call.duration_seconds = transcription.get("duration")
            call.transcript_confidence = transcription.get("confidence")
            call.whisper_model = settings.WHISPER_MODEL_SIZE
            call.status = CallStatus.TRANSCRIBED
            await db.commit()

            # 2. Analyze with GPT
            analysis = await analyze_transcript(call.transcript)
            call.analysis = analysis
            call.compliance_score = analysis.get("compliance", {}).get("score")
            compliance_level = analysis.get("compliance", {}).get("level", "non_compliant")
            call.script_compliance = ScriptCompliance(compliance_level)

            manager_ratio = analysis.get("manager_speech_ratio")
            if manager_ratio is not None:
                call.talk_ratio = manager_ratio

            call.emotions = analysis.get("emotions")
            call.keywords_found = analysis.get("keywords_found", [])
            call.objections_handled = analysis.get("objections")

            call.status = CallStatus.ANALYZED
            call.processed_at = datetime.now(timezone.utc)
            await db.commit()

        except Exception as e:
            call.status = CallStatus.FAILED
            await db.commit()
            raise e


def _call_to_response(call: Call) -> CallResponse:
    return CallResponse(
        id=call.id,
        manager_id=call.manager_id,
        manager_name=call.manager.username if call.manager else None,
        original_filename=call.original_filename,
        duration_seconds=call.duration_seconds,
        status=call.status,
        transcript=call.transcript,
        transcript_confidence=call.transcript_confidence,
        analysis=call.analysis,
        script_compliance=call.script_compliance,
        compliance_score=call.compliance_score,
        talk_ratio=call.talk_ratio,
        emotions=call.emotions,
        keywords_found=call.keywords_found,
        objections_handled=call.objections_handled,
        source=call.source,
        created_at=call.created_at,
        processed_at=call.processed_at,
    )
