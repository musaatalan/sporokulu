# Spor Okulu — proje talimatları

Bu dosya projeyi burada geliştirirken referans ve yapılacaklar listesi olarak kullanılır.

## Amaç

Spor kulübü yönetimi: üye (sporcu) kaydı, yoklama, performans, duyurular, ödeme özeti, mağaza / ikinci el, veli paneli (QR), oyunlaştırma (haftanın sporcusu, günlük ödev).

## Teknoloji

- **Ön yüz:** Next.js (`frontend/`)
- **Arka uç / API:** FastAPI (`backend/`)
- **Veritabanı:** SQLite (`backend/sporokulu.db`) — `DATABASE_URL` ile değiştirilebilir

## Kurulum (backend)

**CMD:**

```bat
cd /d C:\Users\laptot\Desktop\sporokulu\backend && py -3 -m uvicorn main:app --reload --host 127.0.0.1 --port 8020
```

Veya çift tık: `backend\BASLA-API.bat`

**PowerShell:**

```powershell
cd C:\Users\laptot\Desktop\sporokulu\backend
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
py -3 -m pip install -r requirements.txt
py -3 -m uvicorn main:app --reload --host 127.0.0.1 --port 8020
```

Tarayıcıda: **http://127.0.0.1:8020/docs**

## Kurulum (frontend)

```powershell
cd C:\Users\laptot\Desktop\sporokulu\frontend
npm install
npm run dev
```

Örnek veri: `cd backend` → `py -3 seed_data.py` (veya `--force` ile sıfırla).

## Klasör yapısı (özet)

```text
sporokulu/
├── instructions.md
├── backend/          # FastAPI, models, routers, seed_data.py
└── frontend/         # Next.js app, components, lib/api.ts
```

## Tamamlanan modüller (checklist)

- [x] Sporcu CRUD, QR veli sayfası, performans, yoklama, duyurular
- [x] **Ödeme & finans:** `Payment` modeli, `/payments` API, panelde borç özeti + sporcu detayında bekleyen kalemler
- [x] **Mağaza & ikinci el:** `/shop`, `/second-hand`, `ShopProduct` / `ShopOrder`, `SecondHandListing`
- [x] **Oyunlaştırma:** Haftanın sporcusu (`AthleteOfWeek`), günlük ödevler (`DailyHomework`), veli onayı
- [x] **İçerik:** Sporcu / veli tarafında video (YouTube embed) + beslenme tablosu metni
- [x] `seed_data.py` — ödeme, ödev, haftanın sporcusu, mağaza, ikinci el, Ali için video/beslenme
- [x] **Kimlik:** `User` (ADMIN / ANTRENOR / VELI), JWT `/auth/login`, admin-only `/auth/register`, veli `/veli/me/*`, Next.js middleware (`JWT_SECRET` backend ile aynı)

## Cursor / AI için

- Kod değişikliklerini bu repo içinde ve tek görev odaklı tut.
- Yeni bağımlılık: önce `requirements.txt` / `package.json` ile uyum.
