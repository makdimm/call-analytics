import subprocess
import sys
import json
import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from app.core.config import settings

_HELPER = os.path.join(os.path.dirname(__file__), "pw_verify.py")


def _run(args: list[str]) -> dict:
    """Run the password helper script."""
    try:
        r = subprocess.run(
            [sys.executable, _HELPER] + args,
            capture_output=True, text=True, timeout=15,
        )
        return json.loads(r.stdout.strip())
    except (subprocess.TimeoutExpired, json.JSONDecodeError, FileNotFoundError) as e:
        return {"error": str(e)}


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return _run(["verify", hashed_password, plain_password]).get("result", False)


def get_password_hash(password: str) -> str:
    return _run(["hash", password]).get("result", "")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None
