import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import init_db

# Create dirs
os.makedirs(settings.AUDIO_DIR, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
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
app.include_router(auth_router)
app.include_router(calls_router)
app.include_router(analytics_router)
app.include_router(users_router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
