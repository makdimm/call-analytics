from app.api.auth import router as auth_router
from app.api.calls import router as calls_router
from app.api.analytics import router as analytics_router
from app.api.users import router as users_router

__all__ = ["auth_router", "calls_router", "analytics_router", "users_router"]
