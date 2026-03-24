"""Pydantic şemaları — sporcu kayıt / güncelleme / çıktı."""

import re
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

# Kan grubu: A+, A-, B+, B-, AB+, AB-, O+, O-
_BLOOD_GROUP_RE = re.compile(r"^(A|B|AB|O)[+-]$", re.IGNORECASE)

DominantFoot = Literal["sag", "sol", "iki_ayak"]


def _normalize_blood_group(v: str | None) -> str | None:
    if v is None or (isinstance(v, str) and not v.strip()):
        return None
    s = str(v).strip().upper()
    if not _BLOOD_GROUP_RE.match(s):
        raise ValueError("Kan grubu A+, A-, B+, B-, AB+, AB-, O+, O- formatinda olmalidir")
    return s


class SporcuBransDetay(BaseModel):
    """Branş ile ilişkili teknik detaylar (ayak tercihi + mevki)."""

    dominant_foot: DominantFoot | None = Field(
        default=None,
        description="Baskin ayak: sag | sol | iki_ayak",
    )
    position: str | None = Field(
        default=None,
        max_length=80,
        description="Mevki (orn. kaleci, stoper, oyun kurucu)",
    )


class SporcuBase(SporcuBransDetay):
    full_name: str = Field(..., min_length=1, max_length=255)
    birth_date: date | None = None
    gender: str | None = Field(default=None, max_length=20)
    sport_branch: str = Field(..., min_length=1, max_length=120, description="Brans adi (orn. Futbol)")
    height_cm: float | None = Field(default=None, gt=0, le=280, description="Boy (cm)")
    weight_kg: float | None = Field(default=None, gt=0, le=400, description="Kilo (kg)")
    blood_group: str | None = Field(default=None, max_length=8, description="Orn. A+")
    phone: str | None = Field(default=None, max_length=30)
    email: str | None = Field(default=None, max_length=255)
    parent_name: str | None = Field(default=None, max_length=255)
    parent_phone: str | None = Field(default=None, max_length=30)
    registration_date: date | None = Field(default=None, description="Verilmezse bugunun tarihi")
    is_active: bool = True
    notes: str | None = None
    math_grade: float | None = Field(default=None, ge=0, le=100, description="Matematik notu (0-100)")
    turkish_grade: float | None = Field(default=None, ge=0, le=100, description="Turkce notu (0-100)")
    academic_notes: str | None = Field(default=None, max_length=2000)
    profile_video_url: str | None = Field(default=None, max_length=512, description="YouTube veya video URL")
    nutrition_plan_text: str | None = Field(default=None, max_length=8000, description="Beslenme tablosu (metin/markdown)")

    @field_validator("blood_group", mode="before")
    @classmethod
    def validate_blood(cls, v):
        return _normalize_blood_group(v)


class SporcuCreate(SporcuBase):
    pass


class SporcuUpdate(BaseModel):
    """Kısmi güncelleme — gönderilen alanlar değişir."""

    model_config = ConfigDict(extra="forbid")

    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    birth_date: date | None = None
    gender: str | None = Field(default=None, max_length=20)
    sport_branch: str | None = Field(default=None, min_length=1, max_length=120)
    height_cm: float | None = Field(default=None, gt=0, le=280)
    weight_kg: float | None = Field(default=None, gt=0, le=400)
    blood_group: str | None = Field(default=None, max_length=8)
    dominant_foot: DominantFoot | None = None
    position: str | None = Field(default=None, max_length=80)
    phone: str | None = Field(default=None, max_length=30)
    email: str | None = Field(default=None, max_length=255)
    parent_name: str | None = Field(default=None, max_length=255)
    parent_phone: str | None = Field(default=None, max_length=30)
    registration_date: date | None = None
    is_active: bool | None = None
    notes: str | None = None
    math_grade: float | None = Field(default=None, ge=0, le=100)
    turkish_grade: float | None = Field(default=None, ge=0, le=100)
    academic_notes: str | None = Field(default=None, max_length=2000)
    profile_video_url: str | None = Field(default=None, max_length=512)
    nutrition_plan_text: str | None = Field(default=None, max_length=8000)

    @field_validator("blood_group", mode="before")
    @classmethod
    def validate_blood(cls, v):
        if v is None:
            return None
        return _normalize_blood_group(v)


class SporcuOut(SporcuBase):
    id: int
    created_at: datetime
    updated_at: datetime
    qr_token: str | None = Field(default=None, max_length=36)
    qr_target_url: str | None = Field(default=None, max_length=512)

    model_config = ConfigDict(from_attributes=True)


class PerformanceBase(BaseModel):
    """Hiz, Teknik, Sut, Pas, Fizik — 1-10 arasi."""

    hiz: int = Field(..., ge=1, le=10)
    teknik: int = Field(..., ge=1, le=10)
    sut: int = Field(..., ge=1, le=10)
    pas: int = Field(..., ge=1, le=10)
    fizik: int = Field(..., ge=1, le=10)


class PerformanceCreate(PerformanceBase):
    sporcu_id: int = Field(..., ge=1)


class PerformanceUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    hiz: int | None = Field(default=None, ge=1, le=10)
    teknik: int | None = Field(default=None, ge=1, le=10)
    sut: int | None = Field(default=None, ge=1, le=10)
    pas: int | None = Field(default=None, ge=1, le=10)
    fizik: int | None = Field(default=None, ge=1, le=10)


class PerformanceOut(PerformanceBase):
    id: int
    sporcu_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


AttendanceStatus = Literal["geldi", "gelmedi", "gec"]


class AttendanceOut(BaseModel):
    id: int
    sporcu_id: int
    recorded_at: datetime
    status: AttendanceStatus

    model_config = ConfigDict(from_attributes=True)


class AttendanceScanResponse(BaseModel):
    sporcu: SporcuOut
    attendance: AttendanceOut
    parent_notification_simulated: bool = True


class TodayAttendanceEntry(BaseModel):
    sporcu_id: int
    full_name: str
    sport_branch: str
    recorded_at: datetime
    status: AttendanceStatus


class TodayAttendanceResponse(BaseModel):
    date_local: date
    distinct_arrived_today: int
    records: list[TodayAttendanceEntry]


class ManualAttendanceCreate(BaseModel):
    sporcu_id: int = Field(..., ge=1)
    status: AttendanceStatus


class ManualAttendanceResponse(BaseModel):
    sporcu: SporcuOut
    attendance: AttendanceOut


class MonthlyAttendanceReport(BaseModel):
    """Ay icinde antrenman gunu = o gun en az bir sporcu geldi/gec olarak islendi."""

    sporcu_id: int
    year: int
    month: int
    training_days: int
    present_days: int
    missed_days: int
    records_present: int
    records_absent: int
    participation_rate_pct: float | None
    absent_rate_pct: float | None


class AnnouncementCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=5000)
    target_branch: str | None = Field(
        default=None,
        max_length=120,
        description="Bos veya None = tum kulup; doluysa sadece bu bransa",
    )


class AnnouncementOut(BaseModel):
    id: int
    title: str
    content: str
    target_branch: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VeliSporcuPublic(BaseModel):
    full_name: str
    sport_branch: str
    position: str | None
    dominant_foot: str | None
    math_grade: float | None
    turkish_grade: float | None
    academic_notes: str | None
    qr_png_url: str
    profile_video_url: str | None = None
    nutrition_plan_text: str | None = None


class HomeworkOut(BaseModel):
    id: int
    sporcu_id: int
    title: str
    description: str | None
    assigned_for_date: date
    parent_confirmed_at: datetime | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VeliProfileResponse(BaseModel):
    sporcu: VeliSporcuPublic
    performance: PerformanceOut | None
    attendance_month: MonthlyAttendanceReport
    announcements: list[AnnouncementOut]
    is_athlete_of_week: bool = False
    athlete_of_week_note: str | None = None
    homework: list[HomeworkOut] = []


PaymentStatus = Literal["pending", "paid"]


class PaymentCreate(BaseModel):
    sporcu_id: int = Field(..., ge=1)
    title: str = Field(..., min_length=1, max_length=200)
    amount_try: float = Field(..., gt=0)
    due_date: date
    notes: str | None = Field(default=None, max_length=1000)


class PaymentOut(BaseModel):
    id: int
    sporcu_id: int
    title: str
    amount_try: float
    due_date: date
    paid_at: datetime | None
    status: PaymentStatus
    notes: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SporcuDebtRow(BaseModel):
    sporcu_id: int
    full_name: str
    sport_branch: str
    open_items: int
    balance_try: float


class FinanceDashboardSummary(BaseModel):
    total_pending_try: float
    open_payment_count: int
    debtors: list[SporcuDebtRow]


class ShopProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    price_try: float = Field(..., gt=0)
    stock: int = Field(default=0, ge=0)


class ShopProductOut(BaseModel):
    id: int
    name: str
    description: str | None
    price_try: float
    stock: int
    active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ShopOrderCreate(BaseModel):
    product_id: int = Field(..., ge=1)
    quantity: int = Field(default=1, ge=1, le=99)
    buyer_name: str = Field(..., min_length=1, max_length=255)
    buyer_phone: str = Field(..., min_length=5, max_length=30)


class ShopOrderOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    buyer_name: str
    buyer_phone: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SecondHandCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=3000)
    price_try: float | None = Field(default=None, ge=0)
    contact_phone: str = Field(..., min_length=5, max_length=30)
    sport_branch: str | None = Field(default=None, max_length=120)


class SecondHandOut(BaseModel):
    id: int
    title: str
    description: str
    price_try: float | None
    contact_phone: str
    sport_branch: str | None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AthleteOfWeekCreate(BaseModel):
    sporcu_id: int = Field(..., ge=1)
    week_start: date
    note: str | None = Field(default=None, max_length=500)


class AthleteOfWeekOut(BaseModel):
    id: int
    sporcu_id: int
    week_start: date
    note: str | None
    created_at: datetime
    sporcu_name: str | None = None
    sport_branch: str | None = None

    model_config = ConfigDict(from_attributes=True)


class HomeworkCreate(BaseModel):
    sporcu_id: int = Field(..., ge=1)
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    assigned_for_date: date


class HomeworkConfirmBody(BaseModel):
    qr_token: str = Field(..., min_length=10, max_length=80)


UserRole = Literal["ADMIN", "ANTRENOR", "VELI"]


class LoginBody(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=200)


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=200)
    full_name: str | None = Field(default=None, max_length=255)
    role: UserRole
    sporcu_id: int | None = Field(default=None, ge=1)


class UserPublic(BaseModel):
    id: int
    email: str
    full_name: str | None
    role: str
    sporcu_id: int | None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
