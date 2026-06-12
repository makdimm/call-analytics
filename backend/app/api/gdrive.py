from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.config import settings
from app.api.deps import require_admin, get_current_user
from app.models.user import User
from app.services.gdrive.sync_service import sync_from_drive

router = APIRouter(prefix="/api/gdrive", tags=["gdrive"])


@router.post("/sync")
async def trigger_drive_sync(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually trigger Google Drive sync."""
    if not settings.GOOGLE_DRIVE_CREDENTIALS_PATH or not settings.GOOGLE_DRIVE_FOLDER_ID:
        raise HTTPException(status_code=400, detail="Google Drive не настроен. Укажите GOOGLE_DRIVE_CREDENTIALS_PATH и GOOGLE_DRIVE_FOLDER_ID")

    imported = await sync_from_drive(db, current_user.id)
    return {"imported": imported, "folder_id": settings.GOOGLE_DRIVE_FOLDER_ID}
