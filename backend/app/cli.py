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
    """Create default admin and a few test users."""
    from app.core.database import async_session_factory, init_db
    from app.models.user import User, UserRole
    from app.core.security import get_password_hash
    from sqlalchemy import select

    await init_db()
    async with async_session_factory() as db:
        # Create admin
        result = await db.execute(select(User).where(User.username == "admin"))
        if not result.scalar_one_or_none():
            db.add(User(
                username="admin",
                email="admin@example.com",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
            ))
            print("✅ Админ: admin / admin123")

        # Create test managers
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


async def main():
    if len(sys.argv) < 2:
        print("Использование: python -m app.cli [create-admin|seed|help]")
        return

    cmd = sys.argv[1]
    if cmd == "create-admin":
        await create_admin()
    elif cmd == "seed":
        await seed()
    else:
        print("Команды: create-admin, seed")


if __name__ == "__main__":
    asyncio.run(main())
