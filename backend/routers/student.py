"""Sporcu CRUD — kayit, listeleme, guncelleme, silme, QR."""

from datetime import date
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db
from deps import require_staff
from models import Sporcu
from schemas import SporcuCreate, SporcuOut, SporcuUpdate
from services.qr_service import render_qr_png, sporcu_qr_target_url

router = APIRouter(prefix="/sporcular", tags=["sporcular"])


@router.post("", response_model=SporcuOut, status_code=status.HTTP_201_CREATED)
def create_sporcu(
    payload: SporcuCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
):
    data = payload.model_dump()
    reg = data.pop("registration_date", None) or date.today()
    token = str(uuid4())
    target_url = sporcu_qr_target_url(token)
    row = Sporcu(**data, registration_date=reg, qr_token=token, qr_target_url=target_url)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("", response_model=list[SporcuOut])
def list_sporcular(
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
    active_only: bool = Query(False, description="Yalnizca aktif uyeler"),
    branch: str | None = Query(None, description="Brans filtresi (icerme, buyuk/kucuk duyarsiz)"),
    q: str | None = Query(None, description="Isim veya telefon icinde arama"),
):
    stmt = db.query(Sporcu).order_by(Sporcu.created_at.desc())
    if active_only:
        stmt = stmt.filter(Sporcu.is_active.is_(True))
    if branch and branch.strip():
        stmt = stmt.filter(Sporcu.sport_branch.ilike(f"%{branch.strip()}%"))
    if q and q.strip():
        term = f"%{q.strip()}%"
        stmt = stmt.filter(
            or_(
                Sporcu.full_name.ilike(term),
                Sporcu.phone.ilike(term),
                Sporcu.parent_phone.ilike(term),
            )
        )
    return stmt.all()


@router.get("/by-qr/{token}", response_model=SporcuOut)
def get_sporcu_by_qr_token(token: str, db: Session = Depends(get_db)):
    row = db.query(Sporcu).filter(Sporcu.qr_token == token.strip()).first()
    if not row:
        raise HTTPException(status_code=404, detail="Gecersiz QR veya sporcu bulunamadi")
    return row


@router.get("/{sporcu_id}/qr.png")
def get_sporcu_qr_png(sporcu_id: int, db: Session = Depends(get_db)):
    row = db.query(Sporcu).filter(Sporcu.id == sporcu_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Sporcu bulunamadi")
    if not row.qr_target_url:
        raise HTTPException(status_code=404, detail="QR hedef URL atanmamis")
    png = render_qr_png(row.qr_target_url)
    return Response(content=png, media_type="image/png")


@router.get("/{sporcu_id}", response_model=SporcuOut)
def get_sporcu(
    sporcu_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
):
    row = db.query(Sporcu).filter(Sporcu.id == sporcu_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Sporcu bulunamadi")
    return row


@router.patch("/{sporcu_id}", response_model=SporcuOut)
def update_sporcu(
    sporcu_id: int,
    payload: SporcuUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
):
    row = db.query(Sporcu).filter(Sporcu.id == sporcu_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Sporcu bulunamadi")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/{sporcu_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sporcu(
    sporcu_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
):
    row = db.query(Sporcu).filter(Sporcu.id == sporcu_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Sporcu bulunamadi")
    db.delete(row)
    db.commit()
    return None
