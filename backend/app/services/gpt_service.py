import json
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

ANALYSIS_PROMPT = """Ты — аналитик качества продаж. Проанализируй транскрипцию звонка менеджера с клиентом.

Верни ТОЛЬКО JSON без пояснений:

{{
  "compliance": {{
    "score": 0-100,
    "level": "compliant|partial|non_compliant",
    "details": "краткий анализ"
  }},
  "greeting": {{
    "present": true/false,
    "quality": "good|average|poor",
    "text": "как поздоровался"
  }},
  "needs_identification": {{
    "present": true/false,
    "quality": "good|average|poor|none",
    "details": "выявил ли потребности"
  }},
  "presentation": {{
    "present": true/false,
    "quality": "good|average|poor|none",
    "details": "как презентовал продукт"
  }},
  "objections": {{
    "handled": true/false,
    "count": число,
    "details": "какие возражения и как отработал"
  }},
  "closing": {{
    "present": true/false,
    "quality": "good|average|poor|none",
    "details": "пытался ли закрыть сделку"
  }},
  "manager_speech_ratio": число (0-100, процент времени менеджера),
  "emotions": {{
    "manager_tone": "friendly|neutral|aggressive|uncertain",
    "client_tone": "interested|neutral|irritated|negative"
  }},
  "keywords_found": ["ключевые", "слова", "по", "скрипту"],
  "violations": ["нарушения", "если есть"],
  "recommendations": ["рекомендации", "по", "улучшению"],
  "summary": "краткое саммари звонка на русском"
}}

Скрипт продаж: представиться, выявить потребность, презентовать решение, отработать возражения, закрыть на сделку."""


async def analyze_transcript(transcript: str) -> dict:
    if not transcript or len(transcript.strip()) < 20:
        return {
            "compliance": {"score": 0, "level": "non_compliant", "details": "Слишком короткая транскрипция"},
            "summary": "Недостаточно данных для анализа",
        }

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": ANALYSIS_PROMPT}, {"role": "user", "content": transcript}],
        response_format={"type": "json_object"},
        temperature=0.3,
        max_tokens=2000,
    )

    text = response.choices[0].message.content
    return json.loads(text)
