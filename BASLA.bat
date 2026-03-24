@echo off
setlocal
cd /d "%~dp0"

cls
echo.
echo   ============================================================
echo    Gelecegin Yildizlari - Spor Okulu
echo   ============================================================
echo.
echo   ONEMLI: Tarayicida sadece 127.0.0.1 yazmayin - PORT sart!
echo   Dogru adres: http://127.0.0.1:3000/giris
echo.
set "PYCMD="
where py >nul 2>&1
if not errorlevel 1 set "PYCMD=py -3"
if not defined PYCMD (
  where python >nul 2>&1
  if not errorlevel 1 set "PYCMD=python"
)
if not defined PYCMD (
  echo   [HATA] Python bulunamadi. Python 3 kurun; kurulumda "Add python.exe to PATH" isaretleyin.
  pause
  exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
  echo   [HATA] Node.js / npm bulunamadi. nodejs.org LTS kurun, sonra tekrar deneyin.
  pause
  exit /b 1
)

if not exist "%~dp0frontend\node_modules\" (
  echo   Ilk kurulum: npm install - yaklasik 1-3 dk surebilir...
  cd /d "%~dp0frontend"
  call npm install
  if errorlevel 1 (
    echo   [HATA] npm install basarisiz. Yukaridaki hatayi okuyun.
    pause
    exit /b 1
  )
  cd /d "%~dp0"
)

echo.
echo   Simdi 2 ayri siyah pencere acilacak (API + Web).
echo   Bunlari KAPATMAYIN; kapatirsaniz site acilmaz.
echo.
echo   Tarayici, 3000 portu acilana kadar bekleniyor (en fazla ~90 sn).
echo   ============================================================
echo.

start "SporOkulu API (8020)" cmd /k "cd /d %~dp0backend && echo === API 8020 === && %PYCMD% -m uvicorn main:app --reload --host 127.0.0.1 --port 8020 || pause"
timeout /t 2 /nobreak >nul
start "SporOkulu Web (3000)" cmd /k "cd /d %~dp0frontend && echo === Web 3000 === && npm run dev || pause"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\wait-port.ps1" -Port 3000 -Seconds 90
if errorlevel 1 (
  echo.
  echo   [UYARI] 3000 portu acilmadi. SporOkulu Web penceresinde hata var mi bakin.
  echo   Tani icin: BAGLANTI-KONTROL.bat
  echo.
  pause
  exit /b 1
)

start "" "http://127.0.0.1:3000/giris"
echo.
echo   Tarayici acildi. Sayfa gelmezse F5 yapin.
echo   Bu pencereyi kapatabilirsiniz; API ve Web pencereleri acik kalsin.
echo.
pause
