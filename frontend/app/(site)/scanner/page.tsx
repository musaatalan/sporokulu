import type { Metadata } from "next";

import { QrScannerClient } from "@/components/scanner/qr-scanner-client";

export const metadata: Metadata = {
  title: "QR yoklama | Geleceğin Yıldızları",
  description: "Kamera ile sporcu QR okutma ve yoklama",
};

export default function ScannerPage() {
  return <QrScannerClient />;
}
