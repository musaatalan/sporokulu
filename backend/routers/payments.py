"""Aidat ve odeme satirlari."""

from collections import defaultdict
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from deps import require_staff
from models import Payment, Sporcu
from schemas import FinanceDashboardSummary, PaymentCreate, PaymentOut, SporcuDebtRow

router = APIRouter(prefix="/payments", tags=["finans"])


@router.post("", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
def create_payment(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
):
    s = db.query(Sporcu).filter(Sporcu.id == payload.sporcu_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Sporcu bulunamadi")
    row = Payment(
        sporcu_id=payload.sporcu_id,
        title=payload.title.strip(),
        amount_try=payload.amount_try,
        due_date=payload.due_date,
        status="pending",
        notes=payload.notes.strip() if payload.notes else None,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("", response_model=list[PaymentOut])
def list_payments(
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
    sporcu_id: int | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
):
    q = db.query(Payment).order_by(Payment.due_date.desc(), Payment.id.desc())
    if sporcu_id is not None:
        q = q.filter(Payment.sporcu_id == sporcu_id)
    if status_filter in ("pending", "paid"):
        q = q.filter(Payment.status == status_filter)
    return q.all()


@router.patch("/{payment_id}/mark-paid", response_model=PaymentOut)
def mark_payment_paid(
    payment_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
):
    row = db.query(Payment).filter(Payment.id == payment_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Odeme kaydi yok")
    row.status = "paid"
    row.paid_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return row


@router.get("/dashboard-summary", response_model=FinanceDashboardSummary)
def finance_dashboard_summary(
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
):
    pending = db.query(Payment).filter(Payment.status == "pending").all()
    total = sum(p.amount_try for p in pending)
    by_sid: dict[int, list[Payment]] = defaultdict(list)
    for p in pending:
        by_sid[p.sporcu_id].append(p)

    debtors: list[SporcuDebtRow] = []
    for sid, rows in by_sid.items():
        s = db.query(Sporcu).filter(Sporcu.id == sid).first()
        if not s:
            continue
        bal = sum(r.amount_try for r in rows)
        debtors.append(
            SporcuDebtRow(
                sporcu_id=sid,
                full_name=s.full_name,
                sport_branch=s.sport_branch,
                open_items=len(rows),
                balance_try=round(bal, 2),
            )
        )
    debtors.sort(key=lambda x: x.balance_try, reverse=True)
    return FinanceDashboardSummary(
        total_pending_try=round(total, 2),
        open_payment_count=len(pending),
        debtors=debtors,
    )
