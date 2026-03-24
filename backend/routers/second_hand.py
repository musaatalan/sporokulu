"""Ikinci el ilanlar C2C."""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from database import get_db
from models import SecondHandListing
from schemas import SecondHandCreate, SecondHandOut

router = APIRouter(prefix="/second-hand", tags=["ikinci-el"])


@router.get("/listings", response_model=list[SecondHandOut])
def list_listings(
    db: Session = Depends(get_db),
    status_filter: str | None = Query("active", alias="status"),
):
    q = db.query(SecondHandListing).order_by(SecondHandListing.created_at.desc())
    if status_filter:
        q = q.filter(SecondHandListing.status == status_filter)
    return q.limit(100).all()


@router.post("/listings", response_model=SecondHandOut, status_code=status.HTTP_201_CREATED)
def create_listing(payload: SecondHandCreate, db: Session = Depends(get_db)):
    row = SecondHandListing(
        title=payload.title.strip(),
        description=payload.description.strip(),
        price_try=payload.price_try,
        contact_phone=payload.contact_phone.strip(),
        sport_branch=payload.sport_branch.strip() if payload.sport_branch else None,
        status="active",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
