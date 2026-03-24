"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Html5Qrcode } from "html5-qrcode";
import { Camera, RefreshCw, ScanLine } from "lucide-react";

import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { scanAttendanceByQrToken } from "@/lib/api";
import { extractQrToken } from "@/lib/parse-qr-token";

type CameraProps = {
  onSuccess: (message: string) => void;
  onFatal: (message: string) => void;
};

function ScannerCamera({ onSuccess, onFatal }: CameraProps) {
  const rawId = useId();
  const elementId = `qr-${rawId.replace(/:/g, "")}`;
  const processing = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  const onFatalRef = useRef(onFatal);
  onSuccessRef.current = onSuccess;
  onFatalRef.current = onFatal;
  const [apiErr, setApiErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let scanner: Html5Qrcode | null = null;

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        scanner = new Html5Qrcode(elementId, { verbose: false });
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 280, height: 280 } },
          async (decodedText: string) => {
            if (!scanner || processing.current || cancelled) return;
            const token = extractQrToken(decodedText);
            if (!token) return;
            processing.current = true;
            try {
              const res = await scanAttendanceByQrToken(token);
              await scanner.stop();
              await scanner.clear();
              onSuccessRef.current(
                `Veliye "Çocuğunuz tesise giriş yaptı" bildirimi gönderildi · ${res.sporcu.full_name}`,
              );
            } catch (e) {
              processing.current = false;
              const msg = e instanceof Error ? e.message : "Yoklama kaydedilemedi";
              setApiErr(msg);
              window.setTimeout(() => setApiErr(null), 5000);
            }
          },
          () => {},
        );
      } catch (e) {
        if (!cancelled) {
          onFatalRef.current(e instanceof Error ? e.message : "Kamera açılamadı (izin veya HTTPS gerekebilir).");
        }
      }
    })();

    return () => {
      cancelled = true;
      if (scanner) {
        scanner
          .stop()
          .catch(() => {})
          .then(() => scanner?.clear())
          .catch(() => {});
      }
    };
  }, [elementId]);

  return (
    <div className="space-y-3">
      <div
        id={elementId}
        className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-inner"
      />
      {apiErr && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-800" role="alert">
          {apiErr}
        </p>
      )}
    </div>
  );
}

export function QrScannerClient() {
  const [active, setActive] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <PanelPageHeader
        eyebrow="Yoklama"
        title="QR ile giriş kaydı"
        description="Sporcu QR kodunu kameraya gösterin. Kayıt başarılı olunca ekranda onay mesajı görünür."
        icon={ScanLine}
      />

      <div className="mx-auto max-w-lg">
      {fatal && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Kamera / ortam</p>
          <p className="mt-1">{fatal}</p>
          <p className="mt-2 text-xs text-amber-900/80">
            Tarayıcıda kamera izni gerekir; güvenli bağlantı (HTTPS) veya yerel geliştirme adresi kullanın. İzin verip
            sayfayı yenileyin.
          </p>
          <button
            type="button"
            onClick={() => {
              setFatal(null);
              setActive(true);
            }}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-800 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-900"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Tekrar dene
          </button>
        </div>
      )}

      {active && !fatal ? (
        <ScannerCamera
          onSuccess={(msg) => {
            setToast(msg);
            setActive(false);
            window.setTimeout(() => setToast(null), 7000);
          }}
          onFatal={(m) => {
            setFatal(m);
            setActive(false);
          }}
        />
      ) : (
        !fatal && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center">
            <Camera className="mx-auto h-10 w-10 text-slate-400" aria-hidden />
            <p className="mt-3 text-sm font-medium text-slate-700">Tarama tamamlandı</p>
            <button
              type="button"
              onClick={() => setActive(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Yeni tarama
            </button>
          </div>
        )
      )}

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 w-[min(100%-2rem,28rem)] -translate-x-1/2 rounded-xl border border-emerald-200 bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg"
          role="status"
        >
          {toast}
        </div>
      )}
      </div>
    </div>
  );
}
