#!/usr/bin/env python3
"""Backend (uvicorn) ve frontend (npm run dev) sureclerini birlikte baslatir.

Ctrl+C ile bu script sonlanir; alt surecler de sonlandirilmaya calisilir (OS'e bagli).
"""

from __future__ import annotations

import os
import shutil
import signal
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"


def main() -> None:
    if not BACKEND.is_dir() or not FRONTEND.is_dir():
        print("backend/ ve frontend/ klasorleri run_all.py ile ayni dizinde olmali.", file=sys.stderr)
        sys.exit(1)

    npm = shutil.which("npm")
    if not npm:
        print("npm bulunamadi. Node.js kurulu oldugundan emin olun.", file=sys.stderr)
        sys.exit(1)

    py = sys.executable
    procs: list[subprocess.Popen[bytes]] = []

    def shutdown(_sig=None, _frame=None) -> None:
        for p in procs:
            try:
                p.terminate()
            except Exception:
                pass
        time.sleep(0.5)
        for p in procs:
            try:
                p.kill()
            except Exception:
                pass
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, shutdown)

    env_api = os.environ.copy()
    procs.append(
        subprocess.Popen(
            [py, "-m", "uvicorn", "main:app", "--reload", "--host", "127.0.0.1", "--port", "8020"],
            cwd=str(BACKEND),
            env=env_api,
        )
    )

    env_web = os.environ.copy()
    procs.append(
        subprocess.Popen(
            [npm, "run", "dev"],
            cwd=str(FRONTEND),
            env=env_web,
            shell=False,
        )
    )

    print("Gelecegin Yildizlari")
    print("  API:    http://127.0.0.1:8020  (docs: /docs)")
    print("  Web:    http://127.0.0.1:3000")
    print("Durdurmak icin Ctrl+C\n")

    try:
        while True:
            codes = [p.poll() for p in procs]
            if any(c is not None and c != 0 for c in codes):
                print("Bir surec beklenmedik sekilde cikti.", file=sys.stderr)
                shutdown()
            if all(c is not None for c in codes):
                break
            time.sleep(0.5)
    except KeyboardInterrupt:
        shutdown()


if __name__ == "__main__":
    main()
