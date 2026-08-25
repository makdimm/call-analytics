"""
Speaker diarization service for audira.
Uses GPT-4.1-mini to label utterances as manager/client based on conversation context.
"""
import json
import re
import asyncio
import logging
from openai import AsyncOpenAI
from app.core.config import settings

logger = logging.getLogger(__name__)

# GPT model for diarization
DIARIZATION_MODEL = "gpt-5.4-mini"

_client = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


def _build_diarization_prompt(segments: list[dict]) -> str:
    """Build a compact prompt for speaker diarization."""
    lines = []
    for i, seg in enumerate(segments):
        ts = seg.get("start", 0)
        text = seg.get("text", "").strip()
        if text:
            lines.append(f"[{ts:.1f}s] {text}")

    conversation_text = "\n".join(lines)

    # Estimate tokens (rough: 1 token ~= 4 chars for RU)
    estimated_tokens = len(conversation_text) // 3
    logger.info(f"GPT diarization input: {len(segments)} segments, ~{estimated_tokens} tokens")

    return f"""Ты — система определения говорящих в телефонном разговоре менеджера (manager) и клиента (client).

Ниже даны сегменты расшифровки звонка с таймкодами [секунды]. Твоя задача — для каждого сегмента определить, кто говорит.

Правила:
- Первый сегмент почти всегда менеджер (он начинает разговор с приветствия)
- Менеджер: представляется, задаёт вопросы о потребностях, рассказывает о продукте/услуге, отвечает на возражения, предлагает варианты
- Клиент: отвечает на вопросы, описывает свою ситуацию, задаёт уточняющие вопросы, возражает, принимает решения
- Учитывай КОНТЕКСТ соседних реплик — если непонятно по одной фразе, посмотри что было до и после
- Внимание: фразы вроде "да", "ага", "понятно", "хорошо" могут быть как от менеджера, так и от клиента — смотри по контексту
- Звонки могут быть на русском языке

Верни JSON с ключом "segments": [
  {{"id": 0, "speaker": "manager", "text": "...", "timestamp": 0.0}},
  ...
]

Поля: id — индекс сегмента (начинается с 0), speaker — "manager" или "client", text — оригинальный текст сегмента, timestamp — время начала.

Текст звонка:
{conversation_text}

JSON:"""


def _parse_diarization_response(text: str) -> list[dict] | None:
    """Parse GPT response into labeled segments."""
    text = text.strip()
    # Strip markdown code fences
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()

    # Fix trailing commas (do this before any parse)
    text = re.sub(r',\s*([}\]])', r'\1', text)

    try:
        data = json.loads(text, strict=False)
        # GPT returns {"segments": [...]} with response_format=json_object
        if isinstance(data, dict):
            for key in ("segments", "diarization", "speakers", "result", "data"):
                if key in data and isinstance(data[key], list):
                    return data[key]
            # Single object with speaker/id fields
            if "speaker" in data and "id" in data:
                return [data]
        if isinstance(data, list):
            return data
        return None
    except json.JSONDecodeError:
        return None


async def _diarize_with_gpt(segments: list[dict]) -> list[dict] | None:
    """Use GPT to label each segment as manager/client."""
    try:
        prompt = _build_diarization_prompt(segments)
        client = _get_client()

        logger.info("Starting GPT-4.1-mini diarization...")
        response = await client.chat.completions.create(
            model=DIARIZATION_MODEL,
            messages=[
                {"role": "system", "content": "Ты — точная система диаризации телефонных звонков. Определяешь кто говорит: менеджер или клиент. Отвечай только JSON."},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
            max_completion_tokens=8000,
        )

        text = response.choices[0].message.content
        if not text:
            logger.warning("GPT returned empty response")
            return None

        data = _parse_diarization_response(text)
        if not data:
            logger.warning(f"Failed to parse GPT response: {text[:300]}")
            return None

        # Validate: check we got roughly the right number of entries
        result = []
        for item in data:
            speaker = item.get("speaker", "").lower().strip()
            text_val = item.get("text", "").strip()
            ts = item.get("timestamp", 0.0)

            # Normalize speaker label
            if speaker in ("manager", "менеджер", "агент", "мен"):
                speaker = "manager"
            elif speaker in ("client", "клиент", "кл"):
                speaker = "client"
            else:
                # Try to infer from position
                idx = item.get("id", len(result))
                # Don't skip, default to manager
                speaker = "manager"

            if not text_val:
                continue

            result.append({
                "speaker": speaker,
                "text": text_val,
                "timestamp": float(ts) if isinstance(ts, (int, float)) else 0.0,
            })

        logger.info(f"GPT diarization: {sum(1 for c in result if c['speaker']=='manager')} manager, {sum(1 for c in result if c['speaker']=='client')} client utterances")
        return result

    except Exception as e:
        logger.error(f"GPT diarization failed: {e}")
        return None


async def diarize(audio_path: str | None, whisper_segments: list[dict]) -> list[dict]:
    """
    Main entry point: label each whisper segment with a speaker.
    
    Uses GPT-4.1-mini for context-aware speaker labeling.
    Falls back to pause heuristic if GPT fails.
    
    Args:
        audio_path: ignored (kept for API compat), use whisper_segments only
        whisper_segments: [{start, end, text}] from Whisper
    
    Returns:
        [{speaker, text, timestamp}] with speaker labels
    """
    if not whisper_segments:
        return []
    
    valid = [s for s in whisper_segments if s.get("text", "").strip()]
    if not valid:
        return []
    
    if len(valid) == 1:
        # Single segment — can't diarize, label as manager
        s = valid[0]
        return [{"speaker": "manager", "text": s["text"].strip(), "timestamp": s.get("start", 0.0)}]

    # Try GPT diarization first
    try:
        logger.info(f"Starting GPT diarization for {len(valid)} segments...")
        gpt_result = await _diarize_with_gpt(valid)
        if gpt_result and len(gpt_result) >= len(valid) * 0.5:
            logger.info(f"GPT diarization succeeded: {len(gpt_result)} labeled utterances")
            return gpt_result
    except Exception as e:
        logger.warning(f"GPT diarization failed: {e}, falling back to pause heuristic")
    
    # Fallback: simple pause heuristic
    logger.info("Using pause heuristic fallback")
    return _heuristic(valid)


def _heuristic(segments: list[dict]) -> list[dict]:
    """Fallback: simple pause-based speaker toggle."""
    speaker = "manager"
    result = []
    
    for i, seg in enumerate(segments):
        text = seg["text"].strip()
        start = seg.get("start", 0)
        
        if i > 0:
            gap = start - segments[i-1].get("end", start)
        else:
            gap = 999
        
        if gap > 1.5:
            speaker = "client" if speaker == "manager" else "manager"
        
        result.append({
            "speaker": speaker,
            "text": text,
            "timestamp": start,
        })
    
    return result
