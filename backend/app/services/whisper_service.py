import os
import asyncio
from openai import AsyncOpenAI
from app.core.config import settings

# Thread-safe progress tracker: call_id -> progress_percent
_progress_tracker: dict[int, int] = {}

# OpenAI client for Whisper API (reuses the same API key as GPT)
_client = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY, base_url=settings.WHISPER_API_BASE_URL)
    return _client


def get_progress(call_id: int) -> int:
    return _progress_tracker.get(call_id, 0)


def clear_progress(call_id: int):
    _progress_tracker.pop(call_id, None)


async def transcribe_audio(file_path: str, call_id: int | None = None) -> dict:
    """Transcribe audio using OpenAI Whisper API (or compatible).
    
    Falls back to faster-whisper local if WHISPER_FALLBACK_LOCAL=true.
    """

    # Update progress to 10% — connecting to API
    if call_id is not None:
        _progress_tracker[call_id] = 10

    client = _get_client()

    try:
        with open(file_path, "rb") as audio_file:
            if call_id is not None:
                _progress_tracker[call_id] = 20

            transcript = await client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="ru",
                response_format="verbose_json",
                temperature=0.0,
            )

        if call_id is not None:
            _progress_tracker[call_id] = 95

        # Parse response
        text = transcript.text or ""
        duration = getattr(transcript, "duration", None)
        segments = getattr(transcript, "segments", [])

        # Build dialogue segments
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
            "confidence": 0.95,  # API doesn't return confidence, approximate
        }

    except Exception as e:
        # Try local fallback if configured
        if os.environ.get("WHISPER_FALLBACK_LOCAL", "").lower() in ("true", "1"):
            from .whisper_local import transcribe_audio_local
            return await transcribe_audio_local(file_path, call_id)

        if call_id is not None:
            clear_progress(call_id)
        raise e
