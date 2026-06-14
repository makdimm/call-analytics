from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
import bcrypt as bcrypt_mod
from app.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pw = plain_password.encode('utf-8')
    h = hashed_password.encode('utf-8')
    print(f'DEBUG verify: pw_len={len(pw)}, hash_len={len(h)}')
    print(f'DEBUG verify: hash_prefix={hashed_password[:30]}')
    import bcrypt
    result = bcrypt.checkpw(pw, h)
    print(f'DEBUG verify: result={result}')
    return result

def get_password_hash(password: str) -> str:
    return bcrypt_mod.hashpw(password.encode('utf-8'), bcrypt_mod.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({'exp': expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None
