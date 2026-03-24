"""Yoklama — QR tarama ve gunluk liste."""

import re
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from deps import require_staff
from models import Attendance, Sporcu
from services.monthly_attendance import build_monthly_report
from schemas import (
    AttendanceOut,
    AttendanceScanResponse,
    AttendanceStatus,
    ManualAttendanceCreate,
    ManualAttendanceResponse,
    MonthlyAttendanceReport,
    TodayAttendanceEntry,
    TodayAttendanceResponse,
)

router = APIRouter(prefix="/attendance", tags=["yoklama"])

_TOKEN_IN_URL = re.compile(r"sporcu-qr/([0-9a-fA-F-]{36})", re.I)
_TOKEN_PLAIN = re.compile(
    r"^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$"
)


def normalize_qr_token(raw: str) -> str:
    s = (raw or "").strip()
    if not s:
        return ""
    m = _TOKEN_IN_URL.search(s)
    if m:
        return m.group(1).lower()
    m2 = _TOKEN_PLAIN.match(s)
    if m2:
        return s.lower()
    return s


def _local_day_bounds() -> tuple[datetime, datetime]:
    now = datetime.now()
    start = datetime(now.year, now.month, now.day, 0, 0, 0)
    end = start + timedelta(days=1)
    return start, end


@router.post("/manual", response_model=ManualAttendanceResponse, status_code=status.HTTP_201_CREATED)
def manual_attendance(
    payload: ManualAttendanceCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
):
    sporcu = db.query(Sporcu).filter(Sporcu.id == payload.sporcu_id).first()
    if not sporcu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sporcu bulunamadi")
    row = Attendance(sporcu_id=payload.sporcu_id, status=payload.status)
    db.add(row)
    db.commit()
    db.refresh(row)
    return ManualAttendanceResponse(
        sporcu=sporcu,
        attendance=AttendanceOut.model_validate(row),
    )


@router.get("/report/{sporcu_id}", response_model=MonthlyAttendanceReport)
def monthly_attendance_report(
    sporcu_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
    year: int | None = Query(None, ge=2000, le=2100),
    month: int | None = Query(None, ge=1, le=12),
):
    now = datetime.now()
    y = year if year is not None else now.year
    m = month if month is not None else now.month
    rep = build_monthly_report(db, sporcu_id, y, m)
    if rep is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sporcu bulunamadi")
    return rep


@router.post("/scan/{qr_token}", response_model=AttendanceScanResponse)
def scan_qr_attendance(
    qr_token: str,
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
    late: bool = Query(False, description="True ise status 'gec' (gec kalir)"),
):
    token = normalize_qr_token(qr_token)
    if not token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Gecersiz QR icerigi")

    sporcu = db.query(Sporcu).filter(Sporcu.qr_token == token).first()
    if not sporcu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="QR ile sporcu bulunamadi")

    st = "gec" if late else "geldi"
    row = Attendance(sporcu_id=sporcu.id, status=st)
    db.add(row)
    db.commit()
    db.refresh(row)

    return AttendanceScanResponse(
        sporcu=sporcu,
        attendance=AttendanceOut.model_validate(row),
        parent_notification_simulated=True,
    )


@router.get("/today", response_model=TodayAttendanceResponse)
def list_today_attendance(
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
):
    start, end = _local_day_bounds()
    rows = (
        db.query(Attendance)
        .filter(
            Attendance.recorded_at >= start,
            Attendance.recorded_at < end,
            Attendance.status.in_(("geldi", "gec")),
        )
        .order_by(Attendance.recorded_at.desc())
        .all()
    )

    sporcu_ids = {r.sporcu_id for r in rows}
    sporcular = {s.id: s for s in db.query(Sporcu).filter(Sporcu.id.in_(sporcu_ids)).all()} if sporcu_ids else {}

    records: list[TodayAttendanceEntry] = []
    for r in rows:
        s = sporcular.get(r.sporcu_id)
        if not s:
            continue
        st: AttendanceStatus = r.status if r.status in ("geldi", "gelmedi", "gec") else "geldi"
        records.append(
            TodayAttendanceEntry(
                sporcu_id=r.sporcu_id,
                full_name=s.full_name,
                sport_branch=s.sport_branch,
                recorded_at=r.recorded_at,
                status=st,
            )
        )

    return TodayAttendanceResponse(
        date_local=date.today(),
        distinct_arrived_today=len(sporcu_ids),
        records=records,
    )
