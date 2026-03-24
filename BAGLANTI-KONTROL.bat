@echo off
cd /d "%~dp0"
cls
echo.
echo   ============================================================
echo    Baglanti kontrolu - Spor Okulu
echo   ============================================================
echo.
echo   Asagida True gormek icin once BASLA.bat calistirin.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\check-ports.ps1"
echo   Dogru adresler (tam kopyalayin):
echo   http://127.0.0.1:3000/giris
echo   http://127.0.0.1:8020/docs
echo.
echo   YANLIS: sadece 127.0.0.1 veya localhost (port yok)
echo   ============================================================
echo.
pause
