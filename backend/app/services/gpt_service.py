import json
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def load_criteria(db_session_factory) -> list[dict]:
    from app.models.criteria import Criteria
    from sqlalchemy import select
    async with db_session_factory() as db:
        result = await db.execute(select(Criteria).where(Criteria.is_active == True).order_by(Criteria.sort_order))
        items = []
        for c in result.scalars().all():
            items.append({
                "key": c.key, "label": c.label, "description": c.description or "",
                "what_to_check": c.what_to_check or "", "max_score": c.max_score,
                "good_example": c.good_example or "", "partial_example": c.partial_example or "",
                "bad_example": c.bad_example or "",
            })
        return items


async def load_knowledge_base(db_session_factory) -> str:
    from app.models.knowledge_base import KnowledgeBase
    from sqlalchemy import select
    async with db_session_factory() as db:
        result = await db.execute(
            select(KnowledgeBase).where(KnowledgeBase.is_active == True)
            .order_by(KnowledgeBase.category, KnowledgeBase.sort_order)
        )
        entries = result.scalars().all()
        if not entries:
            return ""
    lines = ["\n--- БАЗА ЗНАНИЙ КОМПАНИИ ---"]
    for entry in entries:
        lines.append(f"\n[{entry.category.upper()}] {entry.title}:\n{entry.content}")
    return "\n".join(lines)


def _build_criteria_section(criteria: list[dict]) -> str:
    lines = []
    for i, c in enumerate(criteria, 1):
        lines.append(f"\n{i}. **{c['label']}** ({c['key']}):")
        if c.get("description"):
            lines.append(f"   {c['description']}")
        lines.append(f"   1 (ДА) — {c.get('good_example', 'выполнено')}")
        lines.append(f"   0.5 (ПОЛУДА) — {c.get('partial_example', 'частично')}")
        lines.append(f"   0 (НЕТ) — {c.get('bad_example', 'не выполнено')}")
    return "\n".join(lines)


def _compute_fg_max(criteria: list[dict]) -> float:
    return sum(c.get("max_score", 1.0) for c in criteria)


SPEAKER_INSTRUCTIONS = """
## РАСПОЗНАВАНИЕ ГОВОРЯЩИХ (Speaker Diarization) — КРИТИЧЕСКИ ВАЖНО!

Ниже дана расшифровка звонка в формате [таймштамп]: текст.
Каждая строка — отдельный сегмент, разделённый паузой в речи.

Твоя задача:
1. Для КАЖДОГО сегмента определи speaker: "manager" или "client"
2. Используй ПАТТЕРНЫ, а не догадки:

Менеджер (manager) — ЕСЛИ:
- Начинает разговор, представляется, задаёт первые вопросы
- Структурирует диалог: "давайте я расскажу", "сейчас обсудим", "перейду к..."
- Задаёт вопросы: "расскажите", "как", "что нужно", "когда планируете"
- Презентует продукт/услугу: "у нас есть", "мы предлагаем", "отличается тем что"
- Отрабатывает возражения: "я понимаю, но", "давайте посмотрим", "в чём разница"
- Назначает следующий шаг: "я позвоню", "отправлю КП", "договорились"
- Завершает звонок: "спасибо за уделенное время", "был рад пообщаться"

Клиент (client) — ЕСЛИ:
- Отвечает на вопросы менеджера: "у нас", "мы работаем", "нам нужно"
- Описывает свою ситуацию/компанию: "занимаемся", "находимся", "используем"
- Задаёт уточняющие вопросы: "а сколько стоит", "а какие сроки", "как это работает"
- Высказывает сомнения/возражения: "дорого", "не сейчас", "уже есть", "надо подумать"
- Спрашивает об условиях: "а что входит", "гарантия", "доставка"
- Объясняет почему отказывается или тянет с решением
- Короткие ответы: "да", "нет", "понятно", "хорошо"

ВАЖНО:
- Если сегмент ОЧЕНЬ короткий (1-3 слова) — посмотри на предыдущий диалог для контекста
- Если не уверен — проанализируй паттерн "вопрос-ответ": кто задаёт вопросы = менеджер
- Клиент может задавать вопросы, но они обычно про цену/сроки/условия
- Менеджер может кратко отвечать, но он всегда ведёт диалог
- Паузы >1.5 сек часто указывают на смену говорящего
"""


def _format_segments_for_prompt(segments: list[dict]) -> str:
    """Format Whisper segments with timestamps for better speaker diarization."""
    lines = []
    for i, seg in enumerate(segments):
        start = seg.get("start", 0)
        end = seg.get("end", 0)
        text = seg.get("text", "").strip()
        if not text:
            continue
        gap = seg["start"] - segments[i-1]["end"] if i > 0 else 0
        gap_note = f" [пауза {gap:.1f}с]" if gap > 1.5 else ""
        lines.append(f"[{start:.1f}-{end:.1f}]{gap_note}: {text}")
    return "\n".join(lines)


def _build_prompt(criteria: list[dict], kb_context: str) -> str:
    criteria_section = _build_criteria_section(criteria)
    fg_max = _compute_fg_max(criteria)

    prompt = f"""Ты — асессор (аналитик) качества продаж. Проанализируй звонок менеджера с клиентом.

Сначала определи ТИП ЗВОНКА:
- "new_lead" — Новая заявка, первичный звонок
- "acceleration" — Ускорение, клиент уже в работе
- "clarification" — Уточнение по текущему вопросу
- "auto_answer" — Автоответ, нецелевой

ТЕПЛОТА КЛИЕНТА:
- "cold" / "warm" / "hot" / "non_target"

ОЦЕНИ КАЖДЫЙ КРИТЕРИЙ (0 = НЕТ, 0.5 = ПОЛУДА, 1 = ДА):
{criteria_section}

Также оцени:
- objection_count, objection_types
- manager_tone: "friendly"/"neutral"/"pushy"/"uncertain"
- client_tone: "interested"/"neutral"/"irritated"/"negative"
- crm_quality: 1 / 0.5 / 0

МАКСИМАЛЬНЫЙ FG: {fg_max}

{SPEAKER_INSTRUCTIONS}

Верни ТОЛЬКО JSON:
{{
  "call_type": "...",
  "warmth": "...",
  "criteria_scores": {{
    {', '.join(f'"{c["key"]}": 0-1' for c in criteria)}
  }},
  "fg_score": число (0-100, FG = сумма_баллов / {fg_max} * 100),
  "objection_count": число,
  "objection_types": ["..."],
  "manager_tone": "...",
  "client_tone": "...",
  "crm_quality": 0-1,
  "compliance": {{
    "score": 0-100,
    "level": "compliant|partial|non_compliant",
    "details": "краткий анализ"
  }},
  "summary": "саммари на русском (2-3 предложения)",
  "strengths": ["сильные стороны"],
  "growth_areas": ["что улучшить"],
  "keywords_found": ["ключевые слова"],
  "emotions": {{
    "manager_speech_ratio": число (0-100, % времени менеджера)
  }},
  "conversation": [
    {{"speaker": "manager" или "client", "text": "реплика", "timestamp": число (сек от начала звонка)}}
  ],
  "client_data": {{
    "request": "запрос клиента",
    "income_source": "откуда деньги/чем зарабатывает",
    "age": "возраст или null",
    "city": "город или null",
    "purchase_readiness": "высокая/средняя/низкая",
    "main_objections": ["главные возражения"],
    "result_timeline": "когда хочет результат"
  }}
}}

{kb_context}
"""
    return prompt


async def analyze_transcript(transcript: str, db_factory=None, segments: list[dict] | None = None) -> dict:
    if not transcript or len(transcript.strip()) < 20:
        return {
            "compliance": {"score": 0, "level": "non_compliant", "details": "Слишком короткая транскрипция"},
            "summary": "Недостаточно данных для анализа",
            "fg_score": 0, "criteria_scores": {},
            "call_type": "auto_answer", "warmth": "non_target", "objection_count": 0,
        }

    criteria = await load_criteria(db_factory) if db_factory else None
    if not criteria:
        criteria = [
            {"key": "greeting", "label": "Приветствие", "description": "Полное приветствие, имя, компания", "good_example": "полное с именем и компанией", "partial_example": "неполное", "bad_example": "пропущено", "max_score": 1.0},
            {"key": "speech", "label": "Речь", "description": "Чёткая, без паразитов", "good_example": "чёткая", "partial_example": "редкие паразиты", "bad_example": "много мусора", "max_score": 1.0},
            {"key": "initiative", "label": "Инициатива", "description": "Управление диалогом", "good_example": "управляет", "partial_example": "теряет", "bad_example": "пассивная", "max_score": 2.0},
            {"key": "qualification", "label": "Квалификация", "description": "Выявление потребностей", "good_example": "достаточно вопросов", "partial_example": "недостаточно", "bad_example": "пропущена", "max_score": 2.0},
            {"key": "pain", "label": "Боль", "description": "Вопросы на боль клиента", "good_example": "заданы", "partial_example": "клиент сам сказал", "bad_example": "не заданы", "max_score": 3.0},
            {"key": "product", "label": "Продукт", "description": "Презентация с выгодами", "good_example": "с выгодами", "partial_example": "формальная", "bad_example": "отсутствует", "max_score": 3.0},
            {"key": "expertise", "label": "Экспертность", "description": "Кейсы, опыт", "good_example": "кейсы", "partial_example": "недостаточно", "bad_example": "не ответил", "max_score": 2.0},
            {"key": "closing", "label": "Закрытие", "description": "Закрытие на сделку", "good_example": "закрыл", "partial_example": "КП/встреча", "bad_example": "не закрыл", "max_score": 2.0},
            {"key": "push", "label": "Дожим", "description": "Отработка возражений", "good_example": "отработал", "partial_example": "попытался", "bad_example": "согласился", "max_score": 3.0},
            {"key": "next_step", "label": "След. шаг", "description": "Назначение следующего шага", "good_example": "с датой", "partial_example": "без времени", "bad_example": "отсутствует", "max_score": 2.0},
            {"key": "framing", "label": "Фрейминг", "description": "Подстройка под клиента", "good_example": "подстроился", "partial_example": "незначительно", "bad_example": "спорит", "max_score": 1.0},
        ]

    kb_context = await load_knowledge_base(db_factory) if db_factory else ""

    # Use segments with timestamps for better diarization if available
    if segments and len(segments) > 3:
        user_input = _format_segments_for_prompt(segments)
    else:
        user_input = transcript

    prompt = _build_prompt(criteria, kb_context)

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": prompt}, {"role": "user", "content": user_input}],
        response_format={"type": "json_object"},
        temperature=0.3,
        max_tokens=2500,
    )

    text = response.choices[0].message.content
    # Repair common JSON issues from GPT
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        # Try to fix common GPT JSON errors
        fixed = text
        # Fix unterminated strings (last string before closing brace)
        import re as _re
        # Remove trailing commas before } and ]
        fixed = _re.sub(r',\s*([}\]])', r'\1', fixed)
        # Try parsing with strict=False (allows trailing commas)
        try:
            import json5
            result = json5.loads(fixed)
        except Exception:
            try:
                result = json.loads(fixed, strict=False)
            except Exception:
                # Last resort: truncate to last valid JSON and retry
                for end_char in ['}', ']']:
                    idx = fixed.rfind(end_char)
                    if idx > 10:
                        try:
                            result = json.loads(fixed[:idx+1], strict=False)
                            break
                        except Exception:
                            pass
                else:
                    raise

    if "fg_score" not in result or result.get("fg_score") is None:
        cs = result.get("criteria_scores", {})
        fg_max = _compute_fg_max(criteria)
        if fg_max > 0 and cs:
            total = sum(float(v) for v in cs.values() if isinstance(v, (int, float)))
            result["fg_score"] = round(total / fg_max * 100, 1)
        else:
            result["fg_score"] = 0

    return result
