import os
import io
import hashlib
import asyncio
from datetime import datetime, timezone
from typing import Optional

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from googleapiclient.errors import HttpError

from app.core.config import settings

SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]
_AUDIO_EXTS = {".mp3", ".wav", ".ogg", ".m4a", ".flac", ".webm"}


class GoogleDriveClient:
    """Minimal Google Drive client for polling new audio files."""

    def __init__(self):
        self.service = None
        self._processed_hashes: set[str] = set()

    async def authenticate(self) -> bool:
        """Load or refresh drive credentials."""
        creds_path = settings.GOOGLE_DRIVE_CREDENTIALS_PATH
        if not creds_path or not os.path.exists(creds_path):
            return False

        creds = None
        token_path = creds_path.replace(".json", "_token.json")

        if os.path.exists(token_path):
            import json
            with open(token_path) as f:
                creds = Credentials.from_authorized_user_info(json.load(f), SCOPES)

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(creds_path, SCOPES)
                creds = flow.run_local_server(port=0)
            with open(token_path, "w") as f:
                f.write(creds.to_json())

        self.service = build("drive", "v3", credentials=creds)
        return True

    async def fetch_new_files(self) -> list[dict]:
        """Get new audio files from configured Drive folder."""
        if not self.service:
            return []

        folder_id = settings.GOOGLE_DRIVE_FOLDER_ID
        if not folder_id:
            return []

        try:
            query = (
                f"'{folder_id}' in parents "
                f"and trashed=false "
                f"and ("
                + " or ".join(f"mimeType contains '{ext}'" for ext in _AUDIO_EXTS if ext.startswith("."))
                + ")"
            )

            results = self.service.files().list(
                q=query,
                fields="files(id, name, mimeType, size, createdTime, modifiedTime)",
                orderBy="createdTime desc",
                pageSize=50,
            ).execute()

            files = results.get("files", [])
            new_files = []

            for f in files:
                file_hash = hashlib.md5(f"{f['id']}_{f['modifiedTime']}".encode()).hexdigest()
                if file_hash not in self._processed_hashes:
                    self._processed_hashes.add(file_hash)
                    new_files.append(f)

            return new_files

        except HttpError as e:
            print(f"[gdrive] API error: {e}")
            return []

    async def download_file(self, file_id: str, destination: str) -> Optional[str]:
        """Download a file from Drive to local path."""
        if not self.service:
            return None

        try:
            request = self.service.files().get_media(fileId=file_id)
            fh = io.BytesIO()
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while not done:
                _, done = downloader.next_chunk()

            os.makedirs(os.path.dirname(destination), exist_ok=True)
            with open(destination, "wb") as f:
                f.write(fh.getvalue())

            return destination
        except HttpError as e:
            print(f"[gdrive] download error: {e}")
            return None

    async def poll_loop(self, callback):
        """Periodic polling loop. Runs until cancelled."""
        if not await self.authenticate():
            print("[gdrive] Auth failed, skipping poll loop")
            return

        print(f"[gdrive] Polling started (interval={settings.GOOGLE_DRIVE_POLL_INTERVAL}s)")
        while True:
            try:
                files = await self.fetch_new_files()
                for f in files:
                    try:
                        await callback(f)
                    except Exception as e:
                        print(f"[gdrive] callback error for {f['name']}: {e}")
            except Exception as e:
                print(f"[gdrive] poll error: {e}")

            await asyncio.sleep(settings.GOOGLE_DRIVE_POLL_INTERVAL)
