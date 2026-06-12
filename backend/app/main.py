import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.services.websocket_service import manager

# Create dirs
os.makedirs(settings.AUDIO_DIR, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()

    # Start Google Drive polling if configured
    drive_task = None
    if settings.GOOGLE_DRIVE_CREDENTIALS_PATH and settings.GOOGLE_DRIVE_FOLDER_ID:
        from app.services.gdrive.sync_service import start_drive_polling
        drive_task = asyncio.create_task(start_drive_polling())

    yield

    # Shutdown
    if drive_task:
        drive_task.cancel()
        try:
            await drive_task
        except asyncio.CancelledError:
            pass


app = FastAPI(
    title=settings.APP_NAME,
    version="0.2.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
from app.api import auth_router, calls_router, analytics_router, users_router
from app.api.ws import router as ws_router
from app.api.gdrive import router as gdrive_router

app.include_router(auth_router)
app.include_router(calls_router)
app.include_router(analytics_router)
app.include_router(users_router)
app.include_router(ws_router)
app.include_router(gdrive_router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "0.2.0"}


@app.post("/api/seed")
async def run_seed():
    """Create default users (dev only)."""
    if not settings.DEBUG:
        return {"error": "Only available in DEBUG mode"}
    from app.cli import seed
    await seed()
    return {"ok": True}
