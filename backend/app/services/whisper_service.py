import os
import asyncio
import aiofiles
from openai import AsyncOpenAI
from app.core.config import settings

_progress_tracker: dict[int, int] = {}

# Try API mode first, fall back to local
_api_client = None


def _get_api_client() -> AsyncOpenAI | None:
    global _api_client
    if _api_client is not None:
        return _api_client
    try:
        _api_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY, base_url=settings.WHISPER_API_BASE_URL)
        return _api_client
    except Exception:
        return None


def get_progress(call_id: int) -> int:
    return _progress_tracker.get(call_id, 0)


def clear_progress(call_id: int):
    _progress_tracker.pop(call_id, None)


async def transcribe_audio_api(file_path: str, call_id: int | None = None) -> dict:
    """Transcribe using OpenAI Whisper API (or compatible)."""
    if call_id is not None:
        _progress_tracker[call_id] = 10

    client = _get_api_client()

    async with aiofiles.open(file_path, "rb") as f:
        content = await f.read()

    if call_id is not None:
        _progress_tracker[call_id] = 20

    transcript = await client.audio.transcriptions.create(
        model="whisper-1",
        file=("audio.mp3", content),
        language="ru",
        response_format="verbose_json",
        temperature=0.0,
    )

    if call_id is not None:
        _progress_tracker[call_id] = 95

    text = transcript.text or ""
    duration = getattr(transcript, "duration", None)
    segments = getattr(transcript, "segments", [])

    dialogue = []
    for seg in segments:
        dialogue.append({
            "start": getattr(seg, "start", 0),
            "end": getattr(seg, "end", 0),
            "text": getattr(seg, "text", "").strip(),
        })

    if call_id is not None:
        clear_progress(call_id)

    return {
        "text": text.strip(),
        "language": getattr(transcript, "language", "ru"),
        "duration": duration,
        "segments": dialogue if dialogue else [{"start": 0, "end": duration or 0, "text": text.strip()}],
        "confidence": 0.95,
    }


async def transcribe_audio_local(file_path: str, call_id: int | None = None) -> dict:
    """Transcribe using local faster-whisper (fallback)."""
    from faster_whisper import WhisperModel
    from concurrent.futures import ThreadPoolExecutor

    executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="whisper")
    model = WhisperModel(
        settings.WHISPER_MODEL_SIZE,
        device="cpu",
        compute_type="int8",
        cpu_threads=2,
        num_workers=1,
    )
    loop = asyncio.get_running_loop()

    def _run():
        segments_gen, info = model.transcribe(
            file_path,
            beam_size=5, best_of=5,
            temperature=[0.0, 0.2, 0.4, 0.6, 0.8],
            vad_filter=True,
            language="ru",
            condition_on_previous_text=True,
        )
        total_duration = info.duration or 1
        segments_list = []
        for seg in segments_gen:
            segments_list.append(seg)
            if call_id is not None and total_duration > 0:
                progress = min(95, int((seg.end / total_duration) * 100))
                _progress_tracker[call_id] = max(progress, _progress_tracker.get(call_id, 0))
        return segments_list, info

    if call_id is not None:
        _progress_tracker[call_id] = 5

    segments_list, info = await loop.run_in_executor(executor, _run)

    if call_id is not None:
        clear_progress(call_id)

    full_text = " ".join(seg.text.strip() for seg in segments_list if seg.text)
    dialogue = [{"start": round(seg.start, 2), "end": round(seg.end, 2), "text": seg.text.strip()} for seg in segments_list if seg.text]

    return {
        "text": full_text,
        "language": info.language,
        "duration": info.duration,
        "segments": dialogue,
        "confidence": sum(seg.avg_logprob for seg in segments_list) / len(segments_list) if segments_list else 0,
    }


async def transcribe_audio(file_path: str, call_id: int | None = None) -> dict:
    """Transcribe audio. Tries API first, falls back to local faster-whisper."""
    # Try API mode first
    if settings.WHISPER_PROVIDER == "api":
        try:
            client = _get_api_client()
            if client:
                return await transcribe_audio_api(file_path, call_id)
        except Exception:
            pass  # Fall through to local

    # Fallback to local
    return await transcribe_audio_local(file_path, call_id)
