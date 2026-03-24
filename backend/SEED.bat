@echo off
cd /d "%~dp0"
echo.
echo Ornek veriyi yukluyorum (mevcut SEED varsa --force ile sifirlanir)...
echo.
py -3 seed_data.py --force
echo.
pause
