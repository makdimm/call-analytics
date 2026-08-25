from pydantic import BaseModel, EmailStr
from typing import Literal


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: str | None = None
    role: str | None = None


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Literal["manager"] = "manager"  # 🔒 админ только через создание админом/БД
