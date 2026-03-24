# Geleceğin Yıldızları — Spor Okulu

Sporcu kaydı, performans, yoklama (QR), veli bilgi sayfası ve kulüp duyurularını kapsayan tam yığın uygulama.

| Katman | Teknoloji | Varsayılan adres |
|--------|-----------|------------------|
| API | FastAPI + SQLAlchemy + SQLite | http://127.0.0.1:8020 |
| Arayüz | Next.js 14 (App Router) + Tailwind | http://127.0.0.1:3000 |

## Gereksinimler

- **Python 3.10+** (`py -3` veya `python`)
- **Node.js 18+** ve **npm**

## Hızlı başlangıç (tek komut)

Proje kökünden:

```bat
run_all.bat
```

İki ayrı pencere açılır: API (8020) ve Next.js (3000).

Python ile:

```bash
cd sporokulu
py -3 run_all.py
```

## Manuel kurulum

### 1. Backend

```powershell
cd backend
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1   # PowerShell
# veya: .venv\Scripts\activate.bat  (CMD)

py -3 -m pip install -r requirements.txt
copy .env.example .env         # isteğe bağlı; değerleri düzenleyin
```

**Veritabanı ve şema:** Bu projede Alembic yok. İlk API çalıştığında:

- `main.py` ömrü içinde `Base.metadata.create_all()` yeni tabloları oluşturur.
- SQLite için `database.py` içindeki `apply_sqlite_column_migrations()` eski `sporcular` tablosuna eksik kolonları `ALTER TABLE` ile ekler.

Yani ayrı bir `migrate` komutu çalıştırmanız gerekmez; sunucuyu bir kez başlatmanız yeterlidir.

```powershell
py -3 -m uvicorn main:app --reload --host 127.0.0.1 --port 8020
```

Swagger: http://127.0.0.1:8020/docs  

### 2. Frontend

```powershell
cd frontend
npm install
copy .env.example .env.local   # isteğe bağlı: NEXT_PUBLIC_API_URL
npm run dev
```

### 3. Örnek veri (isteğe bağlı)

```powershell
cd backend
py -3 seed_data.py
```

Boş veritabanına örnek sporcu, performans ve duyuru ekler. Tekrar çalıştırmak için:

```powershell
py -3 seed_data.py --force
```

## Ortam değişkenleri

### `backend/.env` (isteğe bağlı; yoksa kod içi varsayılanlar)

| Değişken | Açıklama |
|----------|-----------|
| `DATABASE_URL` | Örn. `sqlite:///./sporokulu.db` veya PostgreSQL URL |
| `SPOROKULU_PUBLIC_URL` | QR’da kodlanan Next adresi (örn. `http://127.0.0.1:3000`) |
| `SPOROKULU_API_PUBLIC_URL` | Veli sayfasında QR PNG linki (örn. `http://127.0.0.1:8020`) |

### `frontend/.env.local`

| Değişken | Açıklama |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | API tabanı; boşsa `http://127.0.0.1:8020` |

Telefondan test ederken bilgisayarın yerel IP’sini bu adreslerde kullanın.

## Klasör yapısı (özet)

```text
sporokulu/
├── README.md
├── instructions.md
├── BASLA.bat
├── android/          # WebView APK (Android Studio)
├── run_all.py
├── run_all.bat
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── seed_data.py
│   ├── routers/
│   ├── services/
│   └── requirements.txt
└── frontend/
    ├── app/
    ├── components/
    └── package.json
```

## Android APK (WebView)

`android/` klasörü minimal bir **WebView** kabuğudur; derlemek için [Android Studio](https://developer.android.com/studio) ile bu klasörü açıp **Build → Build APK(s)** kullanın. Açılacak adres `android/app/src/main/res/values/strings.xml` içindeki `app_url` ile ayarlanır. Ayrıntı: `android/README.txt`.

Kaynak: [github.com/musaatalan/sporokulu](https://github.com/musaatalan/sporokulu)

## Yararlı bağlantılar

- API kökü: http://127.0.0.1:8020/
- Panel: http://127.0.0.1:3000/dashboard
- Veli sayfası: `/veli/{qr_token}` (sporcu kaydındaki QR ile)
