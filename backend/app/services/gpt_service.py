import json
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

ANALYSIS_PROMPT = """Ты — асессор (аналитик) качества продаж в компании по продаже спецтехники. 
Проанализируй транскрипцию звонка менеджера с клиентом.

Сначала определи **ТИП ЗВОНКА** и **ТЕПЛОТУ**:

ТИПЫ:
- "new_lead" — Новая заявка, первичный звонок
- "acceleration" — Ускорение, клиент уже в работе, нужно подтолкнуть
- "clarification" — Уточнение по текущему вопросу
- "auto_answer" — Автоответ, звонок от поставщика или нецелевой

ТЕПЛОТА:
- "cold" — холодный, клиент не готов покупать
- "warm" — теплый, клиент рассматривает, анализирует
- "hot" — горячий, клиент готов к сделке
- "non_target" — нецелевой звонок

Затем оцени **12 критериев** по шкале: 0 = НЕТ, 0.5 = ПОЛУДА, 1 = ДА.

**Правила оценки:**

1. **greeting** (Приветствие): 
   1 — полное приветствие, имя, компания, пауза, подтверждение
   0.5 — неполное (не назвал имя/компанию/цель)
   0 — пропустил приветствие

2. **speech** (Речь):
   1 — чёткая, структурированная, без слов-паразитов
   0.5 — редкие хезитации, слова-паразиты (ну, типа, как бы)
   0 — много мусора, клиент переспрашивает

3. **initiative** (Инициатива):
   1 — менеджер управляет диалогом, задаёт больше вопросов
   0.5 — инициатива переходит к клиенту, но менеджер перехватывает
   0 — пассивная позиция, клиент рулит

4. **programming** (Программирование):
   1 — использует связку: перехват → цель → вопрос в конце
   0.5 — использует частично (не задаёт вопрос в конце)
   0 — не использует

5. **qualification** (Квалификация):
   1 — задал достаточно вопросов для выявления потребности
   0.5 — недостаточно вопросов
   0 — пропустил квалификацию

6. **pain** (Боль):
   1 — задал вопросы на боль, выяснил что важно
   0.5 — клиент сам обозначил боль
   0 — вопросы на боль не заданы

7. **product** (Продукт):
   1 — подробная презентация с выгодами под потребности клиента
   0.5 — формальная презентация без привязки к боли
   0 — презентация отсутствует

8. **expertise** (Экспертность):
   1 — проявляет экспертность, кейсы, опыт, уверенные ответы
   0.5 — недостаточная экспертность
   0 — не смог ответить на вопросы клиента

9. **closing** (Закрытие на сделку):
   1 — закрыл на сделку (договор, оплата, заказ)
   0.5 — подготовил КП, назначил встречу
   0 — не закрыл

10. **push** (Дожим):
    1 — грамотно отработал возражение, привёл аргументы
    0.5 — попытался, но не дожал
    0 — согласился с возражением, пропустил

11. **next_step** (Следующий шаг):
    1 — чёткий следующий шаг с датой и временем
    0.5 — шаг без чёткого времени ("позвоню на неделе")
    0 — следующий шаг отсутствует

12. **framing** (Фрейминг/подстройка):
    1 — подстроился под клиента, общий язык
    0.5 — незначительные недопонимания
    0 — спорит, перебивает, не подстроился

Также оцени объективно:
- **objection_count** — количество возражений от клиента (0 если нет)
- **objection_types** — какие типы возражений: "дорого", "не сейчас", "уже есть", "нужно подумать" и т.д.
- **manager_tone** — тон менеджера: "friendly" / "neutral" / "pushy" / "uncertain"
- **client_tone** — тон клиента: "interested" / "neutral" / "irritated" / "negative"
- **crm_quality** — насколько хорошо менеджер вёл CRM: 1 (хорошо) / 0.5 (частично) / 0 (плохо)

МАКСИМАЛЬНЫЕ БАЛЛЫ ПО ТИПАМ (для расчёта FG%):
- new_lead: 24 балла (критерии 1-12, но programming=0 для входящих)
- acceleration: 16 баллов (без pain и product)
- clarification: 10 баллов (без programming, pain, product, closing, push)
- auto_answer: 0 баллов (оценка только если есть разговор с клиентом)

Верни ТОЛЬКО JSON по этой схеме:
{
  "call_type": "new_lead|acceleration|clarification|auto_answer",
  "warmth": "cold|warm|hot|non_target",
  "criteria_scores": {
    "greeting": 0-1,
    "speech": 0-1,
    "initiative": 0-1,
    "programming": 0-1,
    "qualification": 0-1,
    "pain": 0-1,
    "product": 0-1,
    "expertise": 0-1,
    "closing": 0-1,
    "push": 0-1,
    "next_step": 0-1,
    "framing": 0-1
  },
  "fg_score": число (0-100, FG = сумма баллов / максимум * 100),
  "objection_count": 0,
  "objection_types": ["типы возражений"],
  "manager_tone": "friendly",
  "client_tone": "interested",
  "crm_quality": 1,
  "compliance": {
    "score": 0-100,
    "level": "compliant|partial|non_compliant",
    "details": "краткий анализ"
  },
  "summary": "краткое саммари звонка на русском (2-3 предложения)",
  "strengths": ["сильные стороны менеджера"],
  "growth_areas": ["что улучшить"],
  "keywords_found": ["ключевые слова"],
  "emotions": {
    "manager_speech_ratio": число (0-100, процент времени менеджера)
  }
}
"""


def _fg_max_by_type(call_type: str, is_inbound: bool) -> int:
    """Максимальные баллы по типу звонка (из легенды конкурента)."""
    mapping = {
        "new_lead": 24,
        "acceleration": 16,
        "clarification": 10,
        "auto_answer": 0,
    }
    return mapping.get(call_type, 16)


async def analyze_transcript(transcript: str) -> dict:
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

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": ANALYSIS_PROMPT}, {"role": "user", "content": transcript}],
        response_format={"type": "json_object"},
        temperature=0.3,
        max_tokens=2500,
    )

    text = response.choices[0].message.content
    result = json.loads(text)

    # Ensure FG score is calculated
    if "fg_score" not in result or result.get("fg_score") is None:
        criteria = result.get("criteria_scores", {})
        call_type = result.get("call_type", "acceleration")
        max_pts = _fg_max_by_type(call_type, False)
        if max_pts > 0 and criteria:
            total = sum(float(v) for v in criteria.values() if isinstance(v, (int, float)))
            result["fg_score"] = round(total / max_pts * 100, 1)
        else:
            result["fg_score"] = 0

    return result
