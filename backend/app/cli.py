"""CLI для администрирования. Использовать через `python -m app.cli` или docker exec."""

import asyncio
import sys


async def create_admin():
    """Create admin user if not exists."""
    from app.core.database import async_session_factory, init_db
    from app.models.user import User, UserRole
    from app.core.security import get_password_hash
    from sqlalchemy import select

    username = input("Логин: ").strip()
    email = input("Email: ").strip()
    password = input("Пароль: ").strip()

    await init_db()
    async with async_session_factory() as db:
        result = await db.execute(select(User).where(User.username == username))
        if result.scalar_one_or_none():
            print(f"❌ Пользователь '{username}' уже существует")
            return

        user = User(
            username=username,
            email=email,
            hashed_password=get_password_hash(password),
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(user)
        await db.commit()
        print(f"✅ Администратор '{username}' создан")


async def seed():
    """Create default admin and test users."""
    from app.core.database import async_session_factory, init_db
    from app.models.user import User, UserRole
    from app.core.security import get_password_hash
    from sqlalchemy import select

    await init_db()
    async with async_session_factory() as db:
        for name in ("alice", "bob", "charlie"):
            result = await db.execute(select(User).where(User.username == name))
            if not result.scalar_one_or_none():
                db.add(User(
                    username=name,
                    email=f"{name}@example.com",
                    hashed_password=get_password_hash("manager123"),
                    role=UserRole.MANAGER,
                ))
                print(f"✅ Менеджер: {name} / manager123")

        await db.commit()


async def seed_criteria():
    """Seed default evaluation criteria into DB."""
    from app.core.database import async_session_factory, init_db
    from app.models.criteria import Criteria
    from sqlalchemy import select

    await init_db()

    default_criteria = [
        {"key": "greeting", "label": "Приветствие", "description": "Полное приветствие, назвать имя, компанию, цель звонка", "good_example": "обратился по имени, пауза, представился, цель, компания", "partial_example": "неполное (не назвал имя/компанию/цель)", "bad_example": "пропустил приветствие", "max_score": 1.0, "sort_order": 1},
        {"key": "speech", "label": "Речь", "description": "Чёткая, структурированная речь без слов-паразитов", "good_example": "чёткая, без паразитов, понятная", "partial_example": "редкие паразиты (ну, типа, как бы)", "bad_example": "много мусора, клиент переспрашивает", "max_score": 1.0, "sort_order": 2},
        {"key": "initiative", "label": "Инициатива", "description": "Менеджер управляет диалогом, задаёт больше вопросов", "good_example": "управляет диалогом, перехватывает инициативу", "partial_example": "иногда теряет, но перехватывает", "bad_example": "пассивная позиция, клиент рулит", "max_score": 2.0, "sort_order": 3},
        {"key": "programming", "label": "Программирование", "description": "Использование связки: перехват → цель → вопрос", "good_example": "перехват+цель+вопрос в конце", "partial_example": "без вопроса в конце", "bad_example": "не использует", "max_score": 2.0, "sort_order": 4},
        {"key": "qualification", "label": "Квалификация", "description": "Выявление потребностей клиента", "good_example": "достаточно вопросов для выявления потребности", "partial_example": "недостаточно вопросов", "bad_example": "пропущена квалификация", "max_score": 2.0, "sort_order": 5},
        {"key": "pain", "label": "Боль", "description": "Вопросы на проблему/боль клиента", "good_example": "задал вопросы на боль, выяснил что важно", "partial_example": "клиент сам обозначил боль", "bad_example": "вопросы на боль не заданы", "max_score": 3.0, "sort_order": 6},
        {"key": "product", "label": "Продукт", "description": "Презентация продукта с выгодами", "good_example": "подробно с выгодами под потребности", "partial_example": "формально без привязки к боли", "bad_example": "презентация отсутствует", "max_score": 3.0, "sort_order": 7},
        {"key": "expertise", "label": "Экспертность", "description": "Знание продукта, кейсы, уверенные ответы", "good_example": "кейсы, опыт, уверенные ответы", "partial_example": "не на все вопросы может ответить", "bad_example": "не смог ответить клиенту", "max_score": 2.0, "sort_order": 8},
        {"key": "closing", "label": "Закрытие", "description": "Закрытие на сделку или следующий шаг", "good_example": "закрыл на сделку (договор/оплата)", "partial_example": "подготовил КП, назначил встречу", "bad_example": "не закрыл, просто попрощался", "max_score": 2.0, "sort_order": 9},
        {"key": "push", "label": "Дожим", "description": "Отработка возражений клиента", "good_example": "аргументированно отработал возражение", "partial_example": "попытался, но не дожал", "bad_example": "согласился с возражением, пропустил", "max_score": 3.0, "sort_order": 10},
        {"key": "next_step", "label": "Следующий шаг", "description": "Чёткое назначение следующего касания", "good_example": "с точной датой и временем", "partial_example": "без чёткого времени (позвоню на неделе)", "bad_example": "отсутствует, отпустил клиента", "max_score": 2.0, "sort_order": 11},
        {"key": "framing", "label": "Фрейминг", "description": "Подстройка под клиента, общий язык", "good_example": "полностью подстроился", "partial_example": "незначительные недопонимания", "bad_example": "спорит, перебивает", "max_score": 1.0, "sort_order": 12},
    ]

    async with async_session_factory() as db:
        count = 0
        for item in default_criteria:
            result = await db.execute(select(Criteria).where(Criteria.key == item["key"]))
            if result.scalar_one_or_none():
                print(f"  ⏩ {item['label']} — уже существует")
                continue
            c = Criteria(**item)
            db.add(c)
            count += 1
            print(f"  ✅ {item['label']} — создан")

        await db.commit()
        print(f"\nИтого: {count} критериев добавлено")


async def main():
    if len(sys.argv) < 2:
        print("Использование: python -m app.cli [create-admin|seed|seed-criteria|help]")
        return

    cmd = sys.argv[1]
    if cmd == "create-admin":
        await create_admin()
    elif cmd == "seed":
        await seed()
    elif cmd == "seed-criteria":
        await seed_criteria()
    else:
        print("Команды: create-admin, seed, seed-criteria")


if __name__ == "__main__":
    asyncio.run(main())
