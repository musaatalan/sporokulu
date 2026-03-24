@echo off
cd /d "%~dp0"
echo.
echo === Spor Okulu API ===
echo Sunucu baslatiliyor. Tarayici acilir; sayfa gelmezse bir kez F5 yapin.
echo.
start "" "http://127.0.0.1:8020/docs"
py -3 -m uvicorn main:app --reload --host 127.0.0.1 --port 8020
pause
