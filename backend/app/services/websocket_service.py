from fastapi import WebSocket
from typing import Set
import json
import asyncio


class ConnectionManager:
    """WebSocket connection manager for real-time updates."""

    def __init__(self):
        self.active: Set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        async with self._lock:
            self.active.add(websocket)

    async def disconnect(self, websocket: WebSocket):
        async with self._lock:
            self.active.discard(websocket)

    async def broadcast(self, message: dict):
        """Send message to all connected clients."""
        dead = set()
        async with self._lock:
            for ws in self.active:
                try:
                    await ws.send_json(message)
                except Exception:
                    dead.add(ws)
            for ws in dead:
                self.active.discard(ws)

    async def send_to(self, websocket: WebSocket, message: dict):
        """Send to a specific client."""
        try:
            await websocket.send_json(message)
        except Exception:
            await self.disconnect(websocket)


manager = ConnectionManager()
