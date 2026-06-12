from pydantic import BaseModel
from datetime import datetime
from app.models.user import UserRole


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    username: str | None = None
    email: str | None = None
    password: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None
