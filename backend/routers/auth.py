"""JWT giris ve admin kayit."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from deps import get_current_user, require_admin
from models import Sporcu, User
from schemas import LoginBody, TokenResponse, UserPublic, UserRegister
from security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_public(u: User) -> UserPublic:
    return UserPublic.model_validate(u)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginBody, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-posta veya sifre hatali")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Hesap pasif")
    token = create_access_token(
        user_id=user.id,
        role=user.role,
        email=user.email,
        sporcu_id=user.sporcu_id,
    )
    return TokenResponse(access_token=token, user=_user_public(user))


@router.get("/me", response_model=UserPublic)
def me(user: User = Depends(get_current_user)):
    return _user_public(user)


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(
    body: UserRegister,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    email = body.email.strip().lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bu e-posta zaten kayitli")

    if body.role == "VELI":
        if body.sporcu_id is None:
            raise HTTPException(status_code=400, detail="Veli rolu icin sporcu_id zorunlu")
        if not db.query(Sporcu).filter(Sporcu.id == body.sporcu_id).first():
            raise HTTPException(status_code=404, detail="Sporcu bulunamadi")
    elif body.sporcu_id is not None:
        raise HTTPException(status_code=400, detail="Bu rol icin sporcu_id verilmemeli")

    row = User(
        email=email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name.strip() if body.full_name and body.full_name.strip() else None,
        role=body.role,
        sporcu_id=body.sporcu_id if body.role == "VELI" else None,
        is_active=True,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _user_public(row)
