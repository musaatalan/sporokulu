import type { PerformanceOut } from "@/lib/types/performance";

/** Radar sırası MiniRadar ile uyumlu (backend alan adları). */
export const RADAR_AXIS_LABELS = ["Hız", "Teknik", "Şut", "Pas", "Fizik"] as const;

/** Backend 1–10 skalası → grafik 0–100. */
export function performanceToRadarValues(p: PerformanceOut): number[] {
  return [p.hiz, p.teknik, p.sut, p.pas, p.fizik].map((x) => Math.min(100, Math.max(0, x * 10)));
}

export function performanceScore(p: PerformanceOut): number {
  const vals = [p.hiz, p.teknik, p.sut, p.pas, p.fizik];
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10);
}

/** Performans kaydı yokken nötr gösterim. */
export function emptyRadarPlaceholder(): number[] {
  return [50, 50, 50, 50, 50];
}
