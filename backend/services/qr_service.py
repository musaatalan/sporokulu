"""Sporcu QR hedef URL ve PNG üretimi (python-qrcode)."""

import os
from io import BytesIO

import qrcode


def sporcu_qr_target_url(token: str) -> str:
    """QR içinde kodlanacak tam URL — veli bilgi sayfasi."""
    base = os.getenv("SPOROKULU_PUBLIC_URL", "http://127.0.0.1:3000").rstrip("/")
    return f"{base}/veli/{token}"


def render_qr_png(data: str, box_size: int = 6, border: int = 2) -> bytes:
    qr = qrcode.QRCode(version=1, box_size=box_size, border=border)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()
