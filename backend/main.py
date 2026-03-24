"""Spor Okulu API — tablolari ilk calistirmada olusturur."""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse

from database import Base, apply_sqlite_column_migrations, backfill_sporcu_qr_tokens, engine
from models import (  # noqa: F401 — metadata'ya kayit
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
from routers.announcements import router as announcements_router
from routers.auth import router as auth_router
from routers.attendance import router as attendance_router
from routers.gamification import router as gamification_router
from routers.payments import router as payments_router
from routers.performance import router as performance_router
from routers.second_hand import router as second_hand_router
from routers.shop import router as shop_router
from routers.student import router as sporcu_router
from routers.veli import router as veli_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    apply_sqlite_column_migrations()
    backfill_sporcu_qr_tokens()
    yield


app = FastAPI(title="Spor Okulu API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(sporcu_router)
app.include_router(performance_router)
app.include_router(attendance_router)
app.include_router(announcements_router)
app.include_router(veli_router)
app.include_router(payments_router)
app.include_router(shop_router)
app.include_router(second_hand_router)
app.include_router(gamification_router)


def _site_public_url() -> str:
    return os.getenv("SPOROKULU_PUBLIC_URL", "http://127.0.0.1:3000").rstrip("/")


@app.get("/")
def root(request: Request):
    accept = (request.headers.get("accept") or "").lower()
    if "text/html" in accept:
        site = _site_public_url()
        giris = f"{site}/giris"
        return HTMLResponse(
            f"""<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Spor Okulu — API</title>
  <style>
    body {{ font-family: system-ui, sans-serif; max-width: 32rem; margin: 3rem auto; padding: 0 1rem;
      line-height: 1.5; color: #0f172a; }}
    a {{ color: #059669; font-weight: 600; }}
    .box {{ background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 1.25rem; }}
  </style>
</head>
<body>
  <h1>Bu adres API sunucusu</h1>
  <p>Giriş ekranı ve panel <strong>web sitesinde</strong> (genelde port <strong>3000</strong>).</p>
  <div class="box">
    <p><a href="{giris}">Giriş sayfasına git →</a></p>
    <p><small>Adres: <code>{giris}</code></small></p>
  </div>
  <p style="margin-top:2rem">Geliştiriciler: <a href="/docs">Swagger (/docs)</a> · <a href="/health">/health</a></p>
</body>
</html>"""
        )
    return JSONResponse(
        {
            "service": "sporokulu",
            "mesaj": "API calisiyor. Tarayicida HTML; JSON istemciler icin bu cevap.",
            "site": _site_public_url(),
            "giris": f"{_site_public_url()}/giris",
            "docs": "/docs",
            "health": "/health",
        }
    )


@app.get("/health")
def health():
    return {"status": "ok", "service": "sporokulu"}
