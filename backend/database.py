"""SQLite (gelistirme) varsayilan; DATABASE_URL ile degistirilebilir."""

import os

from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sporokulu.db")

engine_kwargs: dict = {"future": True}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)


@event.listens_for(engine, "connect")
def _sqlite_pragma(dbapi_conn, _):
    if DATABASE_URL.startswith("sqlite"):
        cur = dbapi_conn.cursor()
        cur.execute("PRAGMA foreign_keys=ON")
        cur.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def backfill_sporcu_qr_tokens() -> None:
    """Eski kayitlara qr_token ve qr_target_url atar."""
    from uuid import uuid4

    from models import Sporcu
    from services.qr_service import sporcu_qr_target_url

    db = SessionLocal()
    try:
        rows = db.query(Sporcu).filter((Sporcu.qr_token.is_(None)) | (Sporcu.qr_token == "")).all()
        for row in rows:
            row.qr_token = str(uuid4())
            row.qr_target_url = sporcu_qr_target_url(row.qr_token)
        if rows:
            db.commit()
    finally:
        db.close()


def apply_sqlite_column_migrations() -> None:
    """Var olan SQLite tablosuna yeni kolonlar (ALTER) — gelistirme kolayligi."""
    if not DATABASE_URL.startswith("sqlite"):
        return
    from sqlalchemy import inspect, text

    insp = inspect(engine)
    if not insp.has_table("sporcular"):
        return
    cols = {c["name"] for c in insp.get_columns("sporcular")}
    alters: list[str] = []
    if "height_cm" not in cols:
        alters.append("ALTER TABLE sporcular ADD COLUMN height_cm FLOAT")
    if "weight_kg" not in cols:
        alters.append("ALTER TABLE sporcular ADD COLUMN weight_kg FLOAT")
    if "blood_group" not in cols:
        alters.append("ALTER TABLE sporcular ADD COLUMN blood_group VARCHAR(8)")
    if "dominant_foot" not in cols:
        alters.append("ALTER TABLE sporcular ADD COLUMN dominant_foot VARCHAR(20)")
    if "position" not in cols:
        alters.append("ALTER TABLE sporcular ADD COLUMN position VARCHAR(80)")
    if "qr_token" not in cols:
        alters.append("ALTER TABLE sporcular ADD COLUMN qr_token VARCHAR(36)")
    if "qr_target_url" not in cols:
        alters.append("ALTER TABLE sporcular ADD COLUMN qr_target_url VARCHAR(512)")
    if "math_grade" not in cols:
        alters.append("ALTER TABLE sporcular ADD COLUMN math_grade FLOAT")
    if "turkish_grade" not in cols:
        alters.append("ALTER TABLE sporcular ADD COLUMN turkish_grade FLOAT")
    if "academic_notes" not in cols:
        alters.append("ALTER TABLE sporcular ADD COLUMN academic_notes TEXT")
    if "profile_video_url" not in cols:
        alters.append("ALTER TABLE sporcular ADD COLUMN profile_video_url VARCHAR(512)")
    if "nutrition_plan_text" not in cols:
        alters.append("ALTER TABLE sporcular ADD COLUMN nutrition_plan_text TEXT")
    if not alters:
        return
    with engine.begin() as conn:
        for sql in alters:
            conn.execute(text(sql))
