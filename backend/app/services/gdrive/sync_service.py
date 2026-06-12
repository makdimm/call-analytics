import os
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.call import Call, CallStatus
from app.services.gdrive.client import GoogleDriveClient
from app.services.websocket_service import manager
from app.api.calls import process_call

ALLOWED_AUDIO_EXT = {".mp3", ".wav", ".ogg", ".m4a", ".flac", ".webm"}


async def sync_from_drive(db: AsyncSession, manager_id: int) -> int:
    """Fetch new files from Google Drive and create calls."""
    client = GoogleDriveClient()
    if not await client.authenticate():
        return 0

    files = await client.fetch_new_files()
    imported = 0

    for f in files:
        ext = os.path.splitext(f["name"])[1].lower()
        if ext not in ALLOWED_AUDIO_EXT:
            continue

        safe_name = f"gdrive_{f['id']}{ext}"
        dest = os.path.join(settings.UPLOAD_DIR, safe_name)

        if not await client.download_file(f["id"], dest):
            continue

        call = Call(
            manager_id=manager_id,
            original_filename=f["name"],
            file_path=dest,
            status=CallStatus.UPLOADED,
            source="google_drive",
            source_file_id=f["id"],
        )
        db.add(call)
        imported += 1

    if imported > 0:
        await db.commit()
        # Start processing imported calls
        for call in db.new:
            if isinstance(call, Call) and call.id:
                asyncio.create_task(process_call(call.id))

    return imported


async def start_drive_polling():
    """Background task: poll Google Drive periodically."""
    from app.core.database import async_session_factory

    client = GoogleDriveClient()
    if not await client.authenticate():
        print("[gdrive] Auth failed — polling disabled")
        return

    print(f"[gdrive] Polling every {settings.GOOGLE_DRIVE_POLL_INTERVAL}s")

    while True:
        try:
            files = await client.fetch_new_files()
            if files:
                async with async_session_factory() as db:
                    imported = 0
                    for f in files:
                        ext = os.path.splitext(f["name"])[1].lower()
                        if ext not in ALLOWED_AUDIO_EXT:
                            continue

                        safe_name = f"gdrive_{f['id']}{ext}"
                        dest = os.path.join(settings.UPLOAD_DIR, safe_name)

                        if not await client.download_file(f["id"], dest):
                            continue

                        call = Call(
                            manager_id=1,  # default user for auto-import
                            original_filename=f["name"],
                            file_path=dest,
                            status=CallStatus.UPLOADED,
                            source="google_drive",
                            source_file_id=f["id"],
                        )
                        db.add(call)
                        imported += 1

                    if imported > 0:
                        await db.commit()
                        await manager.broadcast({
                            "type": "gdrive_sync",
                            "imported": imported,
                        })
                        # Process calls
                        for call in db.new:
                            if isinstance(call, Call) and call.id:
                                asyncio.create_task(process_call(call.id))

        except Exception as e:
            print(f"[gdrive] Poll error: {e}")

        await asyncio.sleep(settings.GOOGLE_DRIVE_POLL_INTERVAL)
