from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.auth import LoginRequest, RegisterRequest, Token
from app.services.auth_service import authenticate_user, register_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=Token)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, data.username, data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный логин или пароль")
    from app.core.security import create_access_token
    token = create_access_token({"sub": user.username, "role": user.role.value, "user_id": user.id})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/register", response_model=Token)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    user = await register_user(db, data)
    from app.core.security import create_access_token
    token = create_access_token({"sub": user.username, "role": user.role.value, "user_id": user.id})
    return {"access_token": token, "token_type": "bearer"}
