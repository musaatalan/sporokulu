"""Haftanin sporcusu ve gunluk odevler."""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from deps import require_staff
from models import AthleteOfWeek, DailyHomework, Sporcu
from schemas import AthleteOfWeekCreate, AthleteOfWeekOut, HomeworkCreate, HomeworkOut

router = APIRouter(prefix="/gamification", tags=["oyunlastirma"])


@router.post("/athlete-of-week", response_model=AthleteOfWeekOut, status_code=status.HTTP_201_CREATED)
def set_athlete_of_week(
    payload: AthleteOfWeekCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
):
    s = db.query(Sporcu).filter(Sporcu.id == payload.sporcu_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Sporcu bulunamadi")
    row = AthleteOfWeek(
        sporcu_id=payload.sporcu_id,
        week_start=payload.week_start,
        note=payload.note.strip() if payload.note else None,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    out = AthleteOfWeekOut.model_validate(row)
    out.sporcu_name = s.full_name
    out.sport_branch = s.sport_branch
    return out


@router.get("/athlete-of-week/current", response_model=AthleteOfWeekOut | None)
def current_athlete_of_week(
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
):
    today = date.today()
    row = (
        db.query(AthleteOfWeek)
        .filter(AthleteOfWeek.week_start <= today)
        .order_by(AthleteOfWeek.week_start.desc())
        .first()
    )
    if not row:
        return None
    s = db.query(Sporcu).filter(Sporcu.id == row.sporcu_id).first()
    out = AthleteOfWeekOut.model_validate(row)
    if s:
        out.sporcu_name = s.full_name
        out.sport_branch = s.sport_branch
    return out


@router.post("/homework", response_model=HomeworkOut, status_code=status.HTTP_201_CREATED)
def create_homework(
    payload: HomeworkCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
):
    s = db.query(Sporcu).filter(Sporcu.id == payload.sporcu_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Sporcu bulunamadi")
    row = DailyHomework(
        sporcu_id=payload.sporcu_id,
        title=payload.title.strip(),
        description=payload.description.strip() if payload.description else None,
        assigned_for_date=payload.assigned_for_date,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/homework", response_model=list[HomeworkOut])
def list_homework(
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
    sporcu_id: int | None = Query(None),
):
    q = db.query(DailyHomework).order_by(DailyHomework.assigned_for_date.desc(), DailyHomework.id.desc())
    if sporcu_id is not None:
        q = q.filter(DailyHomework.sporcu_id == sporcu_id)
    return q.limit(200).all()
