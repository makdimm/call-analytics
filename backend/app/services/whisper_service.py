import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
from faster_whisper import WhisperModel
from app.core.config import settings

_model = None
_whisper_executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="whisper")

# Thread-safe progress tracker: call_id -> progress_percent
_progress_tracker: dict[int, int] = {}


def get_whisper_model() -> WhisperModel:
    global _model
    if _model is None:
        model_size = settings.WHISPER_MODEL_SIZE
        _model = WhisperModel(
            model_size,
            device="cpu",
            compute_type="int8",
            cpu_threads=2,
            num_workers=1,
        )
    return _model


def get_progress(call_id: int) -> int:
    """Get current progress for a call. Thread-safe read from shared dict."""
    return _progress_tracker.get(call_id, 0)


def clear_progress(call_id: int):
    _progress_tracker.pop(call_id, None)


async def transcribe_audio(file_path: str, call_id: int | None = None) -> dict:
    """Transcribe audio using Whisper. Runs in thread pool — never blocks event loop.

    If call_id is provided, progress is tracked in _progress_tracker for real-time polling.
    """
    model = get_whisper_model()
    loop = asyncio.get_running_loop()

    def _run():
        segments_gen, info = model.transcribe(
            file_path,
            beam_size=5,
            best_of=5,
            temperature=[0.0, 0.2, 0.4, 0.6, 0.8],
            vad_filter=True,
            vad_parameters=dict(
                threshold=0.5,
                min_speech_duration_ms=250,
                max_speech_duration_s=3600,
            ),
            language="ru",
            condition_on_previous_text=True,
            word_timestamps=False,
        )

        total_duration = info.duration or 1
        segments_list = []

        # Iterate segments manually for progress tracking
        for seg in segments_gen:
            segments_list.append(seg)
            if call_id is not None and total_duration > 0:
                progress = min(95, int((seg.end / total_duration) * 100))
                _progress_tracker[call_id] = max(progress, _progress_tracker.get(call_id, 0))

        return segments_list, info

    segments_list, info = await loop.run_in_executor(_whisper_executor, _run)

    if call_id is not None:
        clear_progress(call_id)

    full_text = " ".join(seg.text.strip() for seg in segments_list if seg.text)

    dialogue = [
        {"start": round(seg.start, 2), "end": round(seg.end, 2), "text": seg.text.strip()}
        for seg in segments_list
        if seg.text
    ]

    return {
        "text": full_text,
        "language": info.language,
        "duration": info.duration,
        "segments": dialogue,
        "confidence": sum(seg.avg_logprob for seg in segments_list) / len(segments_list) if segments_list else 0,
    }
