"""
Ornek sporcu, performans, yoklama, duyuru, odeme, magaza, ikinci el, oyunlastirma verisi ekler.

Kullanim:
  py -3 seed_data.py
  py -3 seed_data.py --force   # onceki SEED_DEMO kayitlarini silip yeniden yukler
"""

from __future__ import annotations

import argparse
from datetime import date, datetime, timedelta
from uuid import uuid4

from database import Base, SessionLocal, apply_sqlite_column_migrations, engine
from models import (
    Announcement,
    AthleteOfWeek,
    Attendance,
    DailyHomework,
    Payment,
    Performance,
    SecondHandListing,
    ShopOrder,
    ShopProduct,
    Sporcu,
    User,
)
from security import hash_password
from services.qr_service import sporcu_qr_target_url

SEED_MARKER = "SEED_DEMO"
SEED_USER_EMAILS = (
    "admin@geleceginyildizlari.org",
    "veli.ali@geleceginyildizlari.org",
    "veli.zeynep@geleceginyildizlari.org",
)
# Eski seed (.local) pydantic EmailStr ile gecersiz; temizlik icin
LEGACY_SEED_USER_EMAILS = (
    "admin@geleceginyildizlari.local",
    "veli.ali@geleceginyildizlari.local",
    "veli.zeynep@geleceginyildizlari.local",
)


def ensure_schema() -> None:
    Base.metadata.create_all(bind=engine)
    apply_sqlite_column_migrations()


def clear_seed(db) -> None:
    _all_seed_emails = list(SEED_USER_EMAILS) + list(LEGACY_SEED_USER_EMAILS)
    db.query(User).filter(User.email.in_(_all_seed_emails)).delete(synchronize_session=False)

    seed_pids = [r.id for r in db.query(ShopProduct.id).filter(ShopProduct.description.like("%[SEED]%")).all()]
    if seed_pids:
        db.query(ShopOrder).filter(ShopOrder.product_id.in_(seed_pids)).delete(synchronize_session=False)
        db.query(ShopProduct).filter(ShopProduct.id.in_(seed_pids)).delete(synchronize_session=False)
    db.query(SecondHandListing).filter(SecondHandListing.title.like("%[SEED]%")).delete(synchronize_session=False)

    ids = [r.id for r in db.query(Sporcu.id).filter(Sporcu.notes == SEED_MARKER).all()]
    if not ids:
        db.commit()
        return

    db.query(Announcement).filter(Announcement.content.like("%[SEED]%")).delete(synchronize_session=False)
    db.query(Payment).filter(Payment.sporcu_id.in_(ids)).delete(synchronize_session=False)
    db.query(DailyHomework).filter(DailyHomework.sporcu_id.in_(ids)).delete(synchronize_session=False)
    db.query(AthleteOfWeek).filter(AthleteOfWeek.sporcu_id.in_(ids)).delete(synchronize_session=False)
    for sid in ids:
        db.query(Attendance).filter(Attendance.sporcu_id == sid).delete(synchronize_session=False)
        db.query(Performance).filter(Performance.sporcu_id == sid).delete(synchronize_session=False)
    db.query(Sporcu).filter(Sporcu.id.in_(ids)).delete(synchronize_session=False)
    db.commit()


def seed() -> None:
    ensure_schema()
    db = SessionLocal()
    try:
        demo = [
            {
                "full_name": "Ali Yilmaz",
                "sport_branch": "Futbol",
                "position": "Oyun kurucu",
                "dominant_foot": "sag",
                "height_cm": 168,
                "weight_kg": 58,
                "blood_group": "A+",
                "math_grade": 82,
                "turkish_grade": 78,
                "academic_notes": "Disiplinli, dersleri zamaninda tamamliyor.",
                "perf": (7, 8, 6, 7, 8),
            },
            {
                "full_name": "Zeynep Kaya",
                "sport_branch": "Futbol",
                "position": "Kanat",
                "dominant_foot": "sol",
                "height_cm": 162,
                "weight_kg": 52,
                "blood_group": "O+",
                "math_grade": 91,
                "turkish_grade": 88,
                "academic_notes": None,
                "perf": (8, 7, 7, 8, 7),
            },
            {
                "full_name": "Efe Demir",
                "sport_branch": "Basketbol",
                "position": "Forvet",
                "dominant_foot": "iki_ayak",
                "height_cm": 175,
                "weight_kg": 62,
                "blood_group": "B+",
                "math_grade": 74,
                "turkish_grade": 80,
                "academic_notes": "Turnuva haftasi devamsizlik uyarisina dikkat.",
                "perf": (6, 7, 8, 6, 9),
            },
            {
                "full_name": "Defne Arslan",
                "sport_branch": "Futbol",
                "position": "Stoper",
                "dominant_foot": "sag",
                "height_cm": 165,
                "weight_kg": 55,
                "blood_group": None,
                "math_grade": None,
                "turkish_grade": None,
                "academic_notes": None,
                "perf": (7, 7, 5, 8, 8),
            },
            {
                "full_name": "Can Ozdemir",
                "sport_branch": "Basketbol",
                "position": "Guard",
                "dominant_foot": "sag",
                "height_cm": 170,
                "weight_kg": 60,
                "blood_group": "AB-",
                "math_grade": 85,
                "turkish_grade": 72,
                "academic_notes": None,
                "perf": (8, 8, 7, 7, 7),
            },
        ]

        announcements = [
            Announcement(
                title="Hafta sonu antrenman saati",
                content="[SEED] Cumartesi 10:00 gruplari salon A'da toplanacaktir. Forma ve su sisesi unutmayin.",
                target_branch=None,
            ),
            Announcement(
                title="Futbol altyapi toplantisi",
                content="[SEED] Veliler: Pazartesi 18:00 online bilgilendirme. Katilim linki kulup WhatsApp grubunda.",
                target_branch="Futbol",
            ),
        ]

        created_ids: list[int] = []

        for idx, d in enumerate(demo):
            token = str(uuid4())
            s = Sporcu(
                full_name=d["full_name"],
                birth_date=date(2012, 5, 15),
                gender=None,
                sport_branch=d["sport_branch"],
                height_cm=d["height_cm"],
                weight_kg=d["weight_kg"],
                blood_group=d["blood_group"],
                dominant_foot=d["dominant_foot"],
                position=d["position"],
                phone=None,
                email=None,
                parent_name=None,
                parent_phone=None,
                registration_date=date.today(),
                is_active=True,
                notes=SEED_MARKER,
                math_grade=d["math_grade"],
                turkish_grade=d["turkish_grade"],
                academic_notes=d["academic_notes"],
                qr_token=token,
                qr_target_url=sporcu_qr_target_url(token),
            )
            if idx == 0:
                s.profile_video_url = "https://www.youtube.com/watch?v=7PIji8OJvX8"
                s.nutrition_plan_text = (
                    "Öğün|Yiyecek|Miktar\n"
                    "Kahvaltı|Yulaf + süt|1 kase\n"
                    "Ara|Fındık|50 g\n"
                    "Öğle|Tavuk + pilav|1 tabak\n"
                    "Akşam|Sebze + yoğurt|1 porsiyon"
                )
            db.add(s)
            db.flush()
            created_ids.append(s.id)
            h, te, su, pa, fi = d["perf"]
            db.add(
                Performance(
                    sporcu_id=s.id,
                    hiz=h,
                    teknik=te,
                    sut=su,
                    pas=pa,
                    fizik=fi,
                )
            )
            today = datetime.now().replace(hour=10, minute=0, second=0, microsecond=0)
            db.add(Attendance(sporcu_id=s.id, status="geldi", recorded_at=today - timedelta(days=2)))
            db.add(Attendance(sporcu_id=s.id, status="geldi", recorded_at=today - timedelta(days=5)))

        for a in announcements:
            db.add(a)

        first_id = created_ids[0]
        second_id = created_ids[1]
        today_d = date.today()
        week_start = today_d - timedelta(days=today_d.weekday())

        db.add(
            Payment(
                sporcu_id=first_id,
                title="Aidat Mart",
                amount_try=2500.0,
                due_date=today_d + timedelta(days=5),
                status="pending",
                notes=None,
            )
        )
        db.add(
            Payment(
                sporcu_id=second_id,
                title="Forma bedeli",
                amount_try=890.0,
                due_date=today_d,
                status="pending",
                notes="Kismi odeme kabul.",
            )
        )

        db.add(
            AthleteOfWeek(
                sporcu_id=first_id,
                week_start=week_start,
                note="Bu hafta antrenmanlara tam katilim ve olumlu takim oyunu.",
            )
        )

        db.add(
            DailyHomework(
                sporcu_id=first_id,
                title="Gunluk: koordinasyon",
                description="10 dakika ip atlama + 5 dakika denge tahtasi.",
                assigned_for_date=today_d,
            )
        )

        db.add(
            ShopProduct(
                name="Kulup formasi",
                description="[SEED] Resmi mac formasi.",
                price_try=450.0,
                stock=20,
                active=True,
            )
        )
        db.add(
            ShopProduct(
                name="Suluk 750 ml",
                description="[SEED] Antrenman sulugu.",
                price_try=120.0,
                stock=50,
                active=True,
            )
        )

        db.add(
            SecondHandListing(
                title="[SEED] Krampon numara 38",
                description="Az kullanildi, taban iyi durumda.",
                price_try=800.0,
                contact_phone="05551112233",
                sport_branch="Futbol",
                status="active",
            )
        )

        demo_pw = hash_password("123456")
        db.add(
            User(
                email="admin@geleceginyildizlari.org",
                hashed_password=demo_pw,
                full_name="Sistem Yoneticisi",
                role="ADMIN",
                sporcu_id=None,
                is_active=True,
            )
        )
        db.add(
            User(
                email="veli.ali@geleceginyildizlari.org",
                hashed_password=demo_pw,
                full_name="Ali Yilmaz Velisi",
                role="VELI",
                sporcu_id=first_id,
                is_active=True,
            )
        )
        db.add(
            User(
                email="veli.zeynep@geleceginyildizlari.org",
                hashed_password=demo_pw,
                full_name="Zeynep Kaya Velisi",
                role="VELI",
                sporcu_id=second_id,
                is_active=True,
            )
        )

        db.commit()
        print(f"Eklendi: {len(demo)} sporcu + performans + yoklama, {len(announcements)} duyuru.")
        print("Ek: odeme (2), haftanin sporcusu, gunluk odev, 2 magaza urunu, 1 ikinci el ilan.")
        print("Veli linki ornegi (QR token ile): /veli/<token> — token sporcular tablosunda qr_token.")
        print(
            "Giris (sifre 123456): admin@geleceginyildizlari.org | "
            "veli.ali@geleceginyildizlari.org | veli.zeynep@geleceginyildizlari.org",
        )
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="SEED_DEMO kayitlarini sil ve yeniden yukle")
    args = parser.parse_args()

    ensure_schema()
    db = SessionLocal()
    try:
        existing = db.query(Sporcu).filter(Sporcu.notes == SEED_MARKER).count()
        if existing and not args.force:
            print(
                f"Zaten {existing} adet ornek sporcu var. Tekrar yuklemek icin: py -3 seed_data.py --force",
            )
            return
        if args.force:
            clear_seed(db)
    finally:
        db.close()

    seed()


if __name__ == "__main__":
    main()
