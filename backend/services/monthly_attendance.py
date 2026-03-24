"""Aylik yoklama raporu hesabi (Attendance tablosu)."""

from datetime import date, datetime

from sqlalchemy.orm import Session

from models import Attendance, Sporcu
from schemas import MonthlyAttendanceReport


def month_bounds(year: int, month: int) -> tuple[datetime, datetime]:
    start = datetime(year, month, 1, 0, 0, 0)
    if month == 12:
        end = datetime(year + 1, 1, 1, 0, 0, 0)
    else:
        end = datetime(year, month + 1, 1, 0, 0, 0)
    return start, end


def build_monthly_report(db: Session, sporcu_id: int, year: int, month: int) -> MonthlyAttendanceReport | None:
    sporcu = db.query(Sporcu).filter(Sporcu.id == sporcu_id).first()
    if not sporcu:
        return None

    start, end = month_bounds(year, month)
    rows = (
        db.query(Attendance)
        .filter(Attendance.recorded_at >= start, Attendance.recorded_at < end)
        .all()
    )

    club_present_dates: set[date] = set()
    for r in rows:
        if r.status in ("geldi", "gec"):
            club_present_dates.add(r.recorded_at.date())

    training_days = len(club_present_dates)

    student_present_dates: set[date] = set()
    records_present = 0
    records_absent = 0
    for r in rows:
        if r.sporcu_id != sporcu_id:
            continue
        if r.status in ("geldi", "gec"):
            student_present_dates.add(r.recorded_at.date())
            records_present += 1
        elif r.status == "gelmedi":
            records_absent += 1

    present_days = len(student_present_dates)
    missed_days = max(0, training_days - present_days) if training_days > 0 else 0

    participation_rate_pct: float | None
    absent_rate_pct: float | None
    if training_days > 0:
        participation_rate_pct = round(present_days / training_days * 100, 1)
        absent_rate_pct = round(missed_days / training_days * 100, 1)
    elif records_present + records_absent > 0:
        total_r = records_present + records_absent
        participation_rate_pct = round(records_present / total_r * 100, 1)
        absent_rate_pct = round(records_absent / total_r * 100, 1)
    else:
        participation_rate_pct = None
        absent_rate_pct = None

    return MonthlyAttendanceReport(
        sporcu_id=sporcu_id,
        year=year,
        month=month,
        training_days=training_days,
        present_days=present_days,
        missed_days=missed_days,
        records_present=records_present,
        records_absent=records_absent,
        participation_rate_pct=participation_rate_pct,
        absent_rate_pct=absent_rate_pct,
    )
