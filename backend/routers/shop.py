"""Kulup magazasi B2C."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from deps import require_staff
from models import ShopOrder, ShopProduct
from schemas import ShopOrderCreate, ShopOrderOut, ShopProductCreate, ShopProductOut

router = APIRouter(prefix="/shop", tags=["magaza"])


@router.get("/products", response_model=list[ShopProductOut])
def list_products(active_only: bool = True, db: Session = Depends(get_db)):
    q = db.query(ShopProduct).order_by(ShopProduct.id.desc())
    if active_only:
        q = q.filter(ShopProduct.active.is_(True))
    return q.all()


@router.post("/products", response_model=ShopProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ShopProductCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_staff),
):
    row = ShopProduct(
        name=payload.name.strip(),
        description=payload.description.strip() if payload.description else None,
        price_try=payload.price_try,
        stock=payload.stock,
        active=True,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.post("/orders", response_model=ShopOrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: ShopOrderCreate, db: Session = Depends(get_db)):
    prod = db.query(ShopProduct).filter(ShopProduct.id == payload.product_id, ShopProduct.active.is_(True)).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Urun yok veya aktif degil")
    if prod.stock < payload.quantity:
        raise HTTPException(status_code=400, detail="Yetersiz stok")
    prod.stock -= payload.quantity
    order = ShopOrder(
        product_id=payload.product_id,
        quantity=payload.quantity,
        buyer_name=payload.buyer_name.strip(),
        buyer_phone=payload.buyer_phone.strip(),
        status="pending",
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order
