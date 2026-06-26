import json
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

# Cache for criteria and knowledge base (loaded fresh per analysis)
_criteria_cache = None
_kb_cache = None


async def load_criteria(db_session_factory) -> list[dict]:
    """Load all active criteria from DB for prompt building."""
    from app.models.criteria import Criteria
    from sqlalchemy import select

    async with db_session_factory() as db:
        result = await db.execute(
            select(Criteria).where(Criteria.is_active == True).order_by(Criteria.sort_order)
        )
        items = []
        for c in result.scalars().all():
            items.append({
                "key": c.key,
                "label": c.label,
                "description": c.description or "",
                "what_to_check": c.what_to_check or "",
                "bad_example": c.bad_example or "",
                "partial_example": c.partial_example or "",
                "good_example": c.good_example or "",
                "max_score": c.max_score,
            })
        return items


async def load_knowledge_base(db_session_factory) -> str:
    """Load active knowledge base entries as context string."""
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
        lines.append(f"\n[{entry.category.upper()}] {entry.title}:")
        lines.append(entry.content)
    return "\n".join(lines)


def _build_criteria_section(criteria: list[dict]) -> str:
    """Build the criteria evaluation section for the GPT prompt from DB data."""
    lines = []
    for i, c in enumerate(criteria, 1):
        lines.append(f"\n{i}. **{c['label']}** ({c['key']})")
        if c.get("description"):
            lines.append(f"   {c['description']}")
        lines.append(f"   1 (ДА) — {c.get('good_example', 'выполнено')}")
        lines.append(f"   0.5 (ПОЛУДА) — {c.get('partial_example', 'частично')}")
        lines.append(f"   0 (НЕТ) — {c.get('bad_example', 'не выполнено')}")
    return "\n".join(lines)


def _compute_fg_max(criteria: list[dict]) -> float:
    return sum(c.get("max_score", 1.0) for c in criteria)


def _build_prompt(criteria: list[dict], kb_context: str) -> str:
    """Build the complete GPT prompt with dynamic criteria and knowledge base."""
    criteria_section = _build_criteria_section(criteria)
    fg_max = _compute_fg_max(criteria)

    prompt = f"""Ты — асессор (аналитик) качества продаж. Проанализируй транскрипцию звонка менеджера с клиентом.

Сначала определи ТИП ЗВОНКА:
- "new_lead" — Новая заявка, первичный звонок
- "acceleration" — Ускорение, клиент уже в работе, нужно подтолкнуть  
- "clarification" — Уточнение по текущему вопросу
- "auto_answer" — Автоответ, нецелевой звонок

ТЕПЛОТА КЛИЕНТА:
- "cold" — холодный
- "warm" — теплый
- "hot" — горячий
- "non_target" — нецелевой

ОЦЕНИ КАЖДЫЙ КРИТЕРИЙ по шкале: 0 = НЕТ, 0.5 = ПОЛУДА, 1 = ДА

{criteria_section}

Также оцени:
- **objection_count** — количество возражений клиента
- **objection_types** — типы возражений: "дорого", "не сейчас", "уже есть" и т.д.
- **manager_tone** — тон: "friendly" / "neutral" / "pushy" / "uncertain"
- **client_tone** — тон: "interested" / "neutral" / "irritated" / "negative"
- **crm_quality** — качество ведения CRM: 1 / 0.5 / 0

МАКСИМАЛЬНЫЙ FG БАЛЛ: {fg_max} (сумма всех критериев)

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
    "manager_speech_ratio": число (0-100, процент времени менеджера)
  }}
}}

{kb_context}
"""
    return prompt


async def analyze_transcript(transcript: str, db_factory=None) -> dict:
    if not transcript or len(transcript.strip()) < 20:
        return {
            "compliance": {"score": 0, "level": "non_compliant", "details": "Слишком короткая транскрипция"},
            "summary": "Недостаточно данных для анализа",
            "fg_score": 0,
            "criteria_scores": {},
            "call_type": "auto_answer",
            "warmth": "non_target",
            "objection_count": 0,
        }

    # Load dynamic criteria and knowledge base
    criteria = await load_criteria(db_factory) if db_factory else None
    if not criteria:
        # Fallback to default criteria if DB is empty
        criteria = [
            {"key": "greeting", "label": "Приветствие", "description": "Полное приветствие, имя, компания", "good_example": "полное с именем и компанией", "partial_example": "неполное", "bad_example": "пропущено", "max_score": 1.0},
            {"key": "speech", "label": "Речь", "description": "Чёткая, без слов-паразитов", "good_example": "чёткая, без паразитов", "partial_example": "редкие паразиты", "bad_example": "много мусора", "max_score": 1.0},
            {"key": "initiative", "label": "Инициатива", "description": "Управление диалогом", "good_example": "управляет диалогом", "partial_example": "иногда теряет", "bad_example": "пассивная позиция", "max_score": 2.0},
            {"key": "qualification", "label": "Квалификация", "description": "Выявление потребностей", "good_example": "достаточно вопросов", "partial_example": "недостаточно", "bad_example": "пропущена", "max_score": 2.0},
            {"key": "pain", "label": "Боль", "description": "Вопросы на проблему клиента", "good_example": "вопросы на боль заданы", "partial_example": "клиент сам сказал", "bad_example": "не заданы", "max_score": 3.0},
            {"key": "product", "label": "Продукт", "description": "Презентация продукта", "good_example": "с выгодами под потребности", "partial_example": "формальная", "bad_example": "отсутствует", "max_score": 3.0},
            {"key": "expertise", "label": "Экспертность", "description": "Знание продукта, кейсы", "good_example": "кейсы и опыт", "partial_example": "недостаточная", "bad_example": "не ответил на вопросы", "max_score": 2.0},
            {"key": "closing", "label": "Закрытие", "description": "Закрытие на сделку", "good_example": "закрыл на сделку", "partial_example": "КП/встреча", "bad_example": "не закрыл", "max_score": 2.0},
            {"key": "push", "label": "Дожим", "description": "Отработка возражений", "good_example": "отработал с аргументами", "partial_example": "попытался", "bad_example": "согласился", "max_score": 3.0},
            {"key": "next_step", "label": "След. шаг", "description": "Назначение следующего шага", "good_example": "с датой и временем", "partial_example": "без времени", "bad_example": "отсутствует", "max_score": 2.0},
            {"key": "framing", "label": "Фрейминг", "description": "Подстройка под клиента", "good_example": "подстроился", "partial_example": "незначительно", "bad_example": "спорит/перебивает", "max_score": 1.0},
        ]

    kb_context = await load_knowledge_base(db_factory) if db_factory else ""

    prompt = _build_prompt(criteria, kb_context)

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": prompt}, {"role": "user", "content": transcript}],
        response_format={"type": "json_object"},
        temperature=0.3,
        max_tokens=2500,
    )

    text = response.choices[0].message.content
    result = json.loads(text)

    # Ensure FG score calculation
    if "fg_score" not in result or result.get("fg_score") is None:
        cs = result.get("criteria_scores", {})
        fg_max = _compute_fg_max(criteria)
        if fg_max > 0 and cs:
            total = sum(float(v) for v in cs.values() if isinstance(v, (int, float)))
            result["fg_score"] = round(total / fg_max * 100, 1)
        else:
            result["fg_score"] = 0

    return result
