import logging

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, UserRole
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.schemas.auth import RegisterRequest


async def authenticate_user(db: AsyncSession, username: str, password: str) -> User | None:
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


async def register_user(db: AsyncSession, data: RegisterRequest) -> User:
    user = User(
        username=data.username,
        email=data.email,
        hashed_password=get_password_hash(data.password),
        role=UserRole(data.role),
    )
    db.add(user)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Пользователь с таким именем или email уже существует",
        ) from e
    await db.refresh(user)
    return user


async def get_current_user_from_token(db: AsyncSession, token: str) -> User | None:
    payload = decode_access_token(token)
    if payload is None:
        return None
    username = payload.get("sub")
    if username is None:
        return None
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()
