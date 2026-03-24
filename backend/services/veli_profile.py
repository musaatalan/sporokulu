"""Veli ozet sayfasi — QR veya JWT ile ayni veri."""

from __future__ import annotations

import os
from datetime import date, datetime

from sqlalchemy import or_
from sqlalchemy.orm import Session

from models import Announcement, AthleteOfWeek, DailyHomework, Performance, Sporcu
from schemas import AnnouncementOut, HomeworkOut, PerformanceOut, VeliProfileResponse, VeliSporcuPublic

API_PUBLIC = os.getenv("SPOROKULU_API_PUBLIC_URL", "http://127.0.0.1:8020").rstrip("/")


def build_veli_profile_response(
    db: Session,
    sporcu: Sporcu,
    year: int | None = None,
    month: int | None = None,
) -> VeliProfileResponse:
    from services.monthly_attendance import build_monthly_report

    now = datetime.now()
    y = year if year is not None else now.year
    m = month if month is not None else now.month
    rep = build_monthly_report(db, sporcu.id, y, m)
    if rep is None:
        raise ValueError("Rapor olusturulamadi")

    perf_row = db.query(Performance).filter(Performance.sporcu_id == sporcu.id).first()
    perf_out = PerformanceOut.model_validate(perf_row) if perf_row else None

    branch = sporcu.sport_branch.strip() if sporcu.sport_branch else ""
    ann_stmt = db.query(Announcement)
    if branch:
        ann_stmt = ann_stmt.filter(
            or_(
                Announcement.target_branch.is_(None),
                Announcement.target_branch == "",
                Announcement.target_branch.ilike(branch),
            )
        )
    else:
        ann_stmt = ann_stmt.filter(
            or_(Announcement.target_branch.is_(None), Announcement.target_branch == ""),
        )
    ann_stmt = ann_stmt.order_by(Announcement.created_at.desc()).limit(10)
    announcements = [AnnouncementOut.model_validate(a) for a in ann_stmt.all()]

    today_d = date.today()
    aow = (
        db.query(AthleteOfWeek)
        .filter(AthleteOfWeek.week_start <= today_d)
        .order_by(AthleteOfWeek.week_start.desc())
        .first()
    )
    is_aow = bool(aow and aow.sporcu_id == sporcu.id)
    aow_note = aow.note if is_aow else None

    hw_rows = (
        db.query(DailyHomework)
        .filter(DailyHomework.sporcu_id == sporcu.id)
        .order_by(DailyHomework.assigned_for_date.desc(), DailyHomework.id.desc())
        .limit(25)
        .all()
    )
    homework = [HomeworkOut.model_validate(h) for h in hw_rows]

    return VeliProfileResponse(
        sporcu=VeliSporcuPublic(
            full_name=sporcu.full_name,
            sport_branch=sporcu.sport_branch,
            position=sporcu.position,
            dominant_foot=sporcu.dominant_foot,
            math_grade=sporcu.math_grade,
            turkish_grade=sporcu.turkish_grade,
            academic_notes=sporcu.academic_notes,
            qr_png_url=f"{API_PUBLIC}/sporcular/{sporcu.id}/qr.png",
            profile_video_url=sporcu.profile_video_url,
            nutrition_plan_text=sporcu.nutrition_plan_text,
        ),
        performance=perf_out,
        attendance_month=rep,
        announcements=announcements,
        is_athlete_of_week=is_aow,
        athlete_of_week_note=aow_note,
        homework=homework,
    )
