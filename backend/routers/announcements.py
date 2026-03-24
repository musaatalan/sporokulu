"""Kulup duyurulari."""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db
from deps import require_staff
from models import Announcement
from schemas import AnnouncementCreate, AnnouncementOut

router = APIRouter(prefix="/announcements", tags=["duyurular"])


@router.post("", response_model=AnnouncementOut, status_code=status.HTTP_201_CREATED)
def create_announcement(
    payload: AnnouncementCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
):
    tb = payload.target_branch.strip() if payload.target_branch and payload.target_branch.strip() else None
    row = Announcement(title=payload.title.strip(), content=payload.content.strip(), target_branch=tb)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("", response_model=list[AnnouncementOut])
def list_announcements(
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
    limit: int = Query(50, ge=1, le=100),
    branch: str | None = Query(None, description="Brans: tum duyurular + bu bransa ozel"),
):
    stmt = db.query(Announcement).order_by(Announcement.created_at.desc())
    if branch and branch.strip():
        b = branch.strip()
        stmt = stmt.filter(
            or_(
                Announcement.target_branch.is_(None),
                Announcement.target_branch == "",
                Announcement.target_branch.ilike(b),
            )
        )
    return stmt.limit(limit).all()
