"""FastAPI bagimliliklari — JWT ve rol kontrolu."""

from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from database import get_db
from models import User
from security import ALGORITHM, SECRET_KEY

security = HTTPBearer(auto_error=False)


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if creds is None or not creds.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kimlik dogrulama gerekli",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        uid = int(payload.get("sub", 0))
    except (JWTError, ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Gecersiz veya suresi dolmus token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.id == uid, User.is_active.is_(True)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Kullanici bulunamadi")
    return user


def require_staff(user: User = Depends(get_current_user)) -> User:
    if user.role not in ("ADMIN", "ANTRENOR"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu islem icin antrenor veya admin gerekli")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Yalnizca admin")
    return user


def require_veli(user: User = Depends(get_current_user)) -> User:
    if user.role != "VELI" or user.sporcu_id is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Veli hesabi veya sporcu baglantisi yok")
    return user
