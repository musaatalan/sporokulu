"""Spor okulu domain modelleri — sporcu kaydi ve performans."""

from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Sporcu(Base):
    """Kulup uyelik / sporcu temel bilgileri."""

    __tablename__ = "sporcular"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    sport_branch: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    height_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    blood_group: Mapped[str | None] = mapped_column(String(8), nullable=True)
    dominant_foot: Mapped[str | None] = mapped_column(String(20), nullable=True)
    position: Mapped[str | None] = mapped_column(String(80), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    parent_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    parent_phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    registration_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    math_grade: Mapped[float | None] = mapped_column(Float, nullable=True)
    turkish_grade: Mapped[float | None] = mapped_column(Float, nullable=True)
    academic_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    qr_token: Mapped[str | None] = mapped_column(String(36), unique=True, nullable=True, index=True)
    qr_target_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    profile_video_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    nutrition_plan_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    performance: Mapped[Performance | None] = relationship(
        back_populates="sporcu",
        uselist=False,
        cascade="all, delete-orphan",
    )
    attendances: Mapped[list[Attendance]] = relationship(
        back_populates="sporcu",
        cascade="all, delete-orphan",
    )
    payments: Mapped[list[Payment]] = relationship(back_populates="sporcu", cascade="all, delete-orphan")
    homework_assignments: Mapped[list[DailyHomework]] = relationship(
        back_populates="sporcu",
        cascade="all, delete-orphan",
    )


class User(Base):
    """Kulup personeli ve veli girisleri (JWT)."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    sporcu_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("sporcular.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class Attendance(Base):
    """QR veya manuel yoklama kaydi."""

    __tablename__ = "attendances"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sporcu_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("sporcular.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False)

    sporcu: Mapped[Sporcu] = relationship(back_populates="attendances")


class Performance(Base):
    """Sporcu performans skorlari (1-10); her sporcu icin tek kayit."""

    __tablename__ = "performances"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sporcu_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("sporcular.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    hiz: Mapped[int] = mapped_column(Integer, nullable=False)
    teknik: Mapped[int] = mapped_column(Integer, nullable=False)
    sut: Mapped[int] = mapped_column(Integer, nullable=False)
    pas: Mapped[int] = mapped_column(Integer, nullable=False)
    fizik: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    sporcu: Mapped[Sporcu] = relationship(back_populates="performance")


class Announcement(Base):
    """Kulup / brans duyurulari."""

    __tablename__ = "announcements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    target_branch: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)


class Payment(Base):
    """Aidat / odeme satiri."""

    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sporcu_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("sporcular.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    amount_try: Mapped[float] = mapped_column(Float, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", index=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    sporcu: Mapped[Sporcu] = relationship(back_populates="payments")


class ShopProduct(Base):
    """Kulup magazasi (B2C)."""

    __tablename__ = "shop_products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price_try: Mapped[float] = mapped_column(Float, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class ShopOrder(Base):
    """Basit siparis kaydi."""

    __tablename__ = "shop_orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("shop_products.id"), nullable=False, index=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    buyer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    buyer_phone: Mapped[str] = mapped_column(String(30), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class SecondHandListing(Base):
    """Ikinci el ilan (C2C)."""

    __tablename__ = "second_hand_listings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price_try: Mapped[float | None] = mapped_column(Float, nullable=True)
    contact_phone: Mapped[str] = mapped_column(String(30), nullable=False)
    sport_branch: Mapped[str | None] = mapped_column(String(120), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)


class AthleteOfWeek(Base):
    """Haftanin sporcusu."""

    __tablename__ = "athlete_of_week"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sporcu_id: Mapped[int] = mapped_column(Integer, ForeignKey("sporcular.id", ondelete="CASCADE"), nullable=False)
    week_start: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class DailyHomework(Base):
    """Saha disi gorev; veli onayi."""

    __tablename__ = "daily_homework"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sporcu_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("sporcular.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    assigned_for_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    parent_confirmed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    sporcu: Mapped[Sporcu] = relationship(back_populates="homework_assignments")
