import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
from faster_whisper import WhisperModel
from app.core.config import settings

_model = None
_whisper_executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="whisper")


def get_whisper_model() -> WhisperModel:
    global _model
    if _model is None:
        _model = WhisperModel(
            settings.WHISPER_MODEL_SIZE,
            device="cpu",
            compute_type="int8",
            cpu_threads=4,
            num_workers=1,
        )
    return _model


async def transcribe_audio(file_path: str) -> dict:
    """Transcribe audio using Whisper. Runs in thread pool — never blocks event loop."""
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

        # Consume generator inside the thread
        segments = list(segments_gen)
        return segments, info

    segments_list, info = await loop.run_in_executor(_whisper_executor, _run)

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
