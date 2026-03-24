"""Performans CRUD — sporcu basina tek kayit."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from deps import require_staff
from models import Performance, Sporcu
from schemas import PerformanceCreate, PerformanceOut, PerformanceUpdate

router = APIRouter(prefix="/performance", tags=["performance"])


@router.get("", response_model=list[PerformanceOut])
def list_performances(
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
    sporcu_id: int | None = Query(None, description="Tek sporcu filtre"),
):
    stmt = db.query(Performance).order_by(Performance.updated_at.desc())
    if sporcu_id is not None:
        stmt = stmt.filter(Performance.sporcu_id == sporcu_id)
    return stmt.all()


@router.get("/sporcu/{sporcu_id}", response_model=PerformanceOut)
def get_performance_for_sporcu(
    sporcu_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
):
    row = db.query(Performance).filter(Performance.sporcu_id == sporcu_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Performans kaydi yok")
    return row


@router.post("", response_model=PerformanceOut, status_code=status.HTTP_201_CREATED)
def create_performance(
    payload: PerformanceCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
):
    sporcu = db.query(Sporcu).filter(Sporcu.id == payload.sporcu_id).first()
    if not sporcu:
        raise HTTPException(status_code=404, detail="Sporcu bulunamadi")
    exists = db.query(Performance).filter(Performance.sporcu_id == payload.sporcu_id).first()
    if exists:
        raise HTTPException(status_code=409, detail="Bu sporcu icin performans zaten var; PATCH kullanin")
    data = payload.model_dump(exclude={"sporcu_id"})
    row = Performance(sporcu_id=payload.sporcu_id, **data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.patch("/sporcu/{sporcu_id}", response_model=PerformanceOut)
def update_performance(
    sporcu_id: int,
    payload: PerformanceUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
):
    row = db.query(Performance).filter(Performance.sporcu_id == sporcu_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Performans kaydi yok")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/sporcu/{sporcu_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_performance(
    sporcu_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
):
    row = db.query(Performance).filter(Performance.sporcu_id == sporcu_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Performans kaydi yok")
    db.delete(row)
    db.commit()
    return None
