"""Veli — QR token ile herkese acik; JWT ile /me alt yollari."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from deps import require_veli
from models import DailyHomework, Sporcu, User
from routers.attendance import normalize_qr_token
from schemas import HomeworkConfirmBody, HomeworkOut, VeliProfileResponse
from services.veli_profile import build_veli_profile_response

router = APIRouter(prefix="/veli", tags=["veli"])


@router.get("/profil/{qr_token}", response_model=VeliProfileResponse)
def veli_profil(
    qr_token: str,
    db: Session = Depends(get_db),
    year: int | None = Query(None, ge=2000, le=2100),
    month: int | None = Query(None, ge=1, le=12),
):
    token = normalize_qr_token(qr_token)
    if not token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Gecersiz token")

    sporcu = db.query(Sporcu).filter(Sporcu.qr_token == token).first()
    if not sporcu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sporcu bulunamadi")

    try:
        return build_veli_profile_response(db, sporcu, year, month)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rapor olusturulamadi")


@router.get("/me/profil", response_model=VeliProfileResponse)
def veli_profil_me(
    db: Session = Depends(get_db),
    v_user: User = Depends(require_veli),
    year: int | None = Query(None, ge=2000, le=2100),
    month: int | None = Query(None, ge=1, le=12),
):
    sporcu = db.query(Sporcu).filter(Sporcu.id == v_user.sporcu_id).first()
    if not sporcu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sporcu bulunamadi")
    try:
        return build_veli_profile_response(db, sporcu, year, month)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rapor olusturulamadi")


@router.post("/homework/{homework_id}/confirm", response_model=HomeworkOut)
def veli_confirm_homework(
    homework_id: int,
    body: HomeworkConfirmBody,
    db: Session = Depends(get_db),
):
    token = normalize_qr_token(body.qr_token)
    if not token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Gecersiz token")
    sporcu = db.query(Sporcu).filter(Sporcu.qr_token == token).first()
    if not sporcu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sporcu bulunamadi")
    hw = db.query(DailyHomework).filter(DailyHomework.id == homework_id).first()
    if not hw or hw.sporcu_id != sporcu.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Odev bulunamadi")
    if hw.parent_confirmed_at is None:
        hw.parent_confirmed_at = datetime.utcnow()
        db.commit()
        db.refresh(hw)
    return HomeworkOut.model_validate(hw)


@router.post("/me/homework/{homework_id}/confirm", response_model=HomeworkOut)
def veli_confirm_homework_me(
    homework_id: int,
    db: Session = Depends(get_db),
    v_user: User = Depends(require_veli),
):
    hw = db.query(DailyHomework).filter(DailyHomework.id == homework_id).first()
    if not hw or hw.sporcu_id != v_user.sporcu_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Odev bulunamadi")
    if hw.parent_confirmed_at is None:
        hw.parent_confirmed_at = datetime.utcnow()
        db.commit()
        db.refresh(hw)
    return HomeworkOut.model_validate(hw)
