import { getStoredAccessToken } from "@/lib/auth-cookie";
import type { AnnouncementOut } from "@/lib/types/announcement";
import type {
  AttendanceScanResponse,
  ManualAttendanceResponse,
  ManualAttendanceStatus,
  MonthlyAttendanceReport,
  TodayAttendanceResponse,
} from "@/lib/types/attendance";
import type { PerformanceOut } from "@/lib/types/performance";
import type { SporcuOut } from "@/lib/types/sporcu";
import type { HomeworkItem, VeliProfileResponse } from "@/lib/types/veli-profile";

export type AuthFetchOpts = { headers?: HeadersInit };

export function withAuth(init?: RequestInit, serverHeaders?: HeadersInit): RequestInit {
  const headers = new Headers(init?.headers);
  if (serverHeaders) {
    new Headers(serverHeaders).forEach((v, k) => headers.set(k, v));
  }
  if (typeof window !== "undefined") {
    const t = getStoredAccessToken();
    if (t) headers.set("Authorization", `Bearer ${t}`);
  }
  return { ...init, headers };
}

/**
 * Backend tabanı. Üretimde ortam değişkeni ile ayarlayın.
 */
export function getApiBaseUrl(): string {
  const u = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (u) return u.replace(/\/$/, "");
  return "http://127.0.0.1:8020";
}

export interface UserPublic {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  sporcu_id: number | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserPublic;
}

export async function loginRequest(email: string, password: string): Promise<TokenResponse> {
  const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return JSON.parse(text) as TokenResponse;
}

export async function createSporcu(body: Record<string, unknown>, auth?: AuthFetchOpts): Promise<unknown> {
  const res = await fetch(
    `${getApiBaseUrl()}/sporcular`,
    withAuth(
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      auth?.headers,
    ),
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  return text ? JSON.parse(text) : null;
}

export async function listSporcular(
  params?: { active_only?: boolean; q?: string; branch?: string },
  auth?: AuthFetchOpts,
): Promise<SporcuOut[]> {
  const search = new URLSearchParams();
  if (params?.active_only) search.set("active_only", "true");
  if (params?.q?.trim()) search.set("q", params.q.trim());
  if (params?.branch?.trim()) search.set("branch", params.branch.trim());
  const qs = search.toString();
  const url = `${getApiBaseUrl()}/sporcular${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, withAuth({ cache: "no-store" }, auth?.headers));
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  return text ? (JSON.parse(text) as SporcuOut[]) : [];
}

export async function getSporcu(id: number, auth?: AuthFetchOpts): Promise<SporcuOut> {
  const res = await fetch(`${getApiBaseUrl()}/sporcular/${id}`, withAuth({ cache: "no-store" }, auth?.headers));
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  return JSON.parse(text) as SporcuOut;
}

export async function getSporcuByQrToken(token: string): Promise<SporcuOut> {
  const t = encodeURIComponent(token.trim());
  const res = await fetch(`${getApiBaseUrl()}/sporcular/by-qr/${t}`, { cache: "no-store" });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  return JSON.parse(text) as SporcuOut;
}

export async function listPerformances(auth?: AuthFetchOpts): Promise<PerformanceOut[]> {
  const res = await fetch(`${getApiBaseUrl()}/performance`, withAuth({ cache: "no-store" }, auth?.headers));
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  return text ? (JSON.parse(text) as PerformanceOut[]) : [];
}

/** 404 ise null döner. */
export async function getPerformanceForSporcu(id: number, auth?: AuthFetchOpts): Promise<PerformanceOut | null> {
  const res = await fetch(
    `${getApiBaseUrl()}/performance/sporcu/${id}`,
    withAuth({ cache: "no-store" }, auth?.headers),
  );
  if (res.status === 404) return null;
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  return JSON.parse(text) as PerformanceOut;
}

export function sporcuQrPngUrl(sporcuId: number): string {
  return `${getApiBaseUrl()}/sporcular/${sporcuId}/qr.png`;
}

export async function scanAttendanceByQrToken(
  token: string,
  opts?: { late?: boolean },
  auth?: AuthFetchOpts,
): Promise<AttendanceScanResponse> {
  const q = new URLSearchParams();
  if (opts?.late) q.set("late", "true");
  const qs = q.toString();
  const enc = encodeURIComponent(token);
  const res = await fetch(
    `${getApiBaseUrl()}/attendance/scan/${enc}${qs ? `?${qs}` : ""}`,
    withAuth({ method: "POST" }, auth?.headers),
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  return JSON.parse(text) as AttendanceScanResponse;
}

export async function getAttendanceToday(auth?: AuthFetchOpts): Promise<TodayAttendanceResponse> {
  const res = await fetch(`${getApiBaseUrl()}/attendance/today`, withAuth({ cache: "no-store" }, auth?.headers));
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  return JSON.parse(text) as TodayAttendanceResponse;
}

export async function postManualAttendance(
  sporcuId: number,
  status: ManualAttendanceStatus,
  auth?: AuthFetchOpts,
): Promise<ManualAttendanceResponse> {
  const res = await fetch(
    `${getApiBaseUrl()}/attendance/manual`,
    withAuth(
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sporcu_id: sporcuId, status }),
      },
      auth?.headers,
    ),
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  return JSON.parse(text) as ManualAttendanceResponse;
}

export async function getMonthlyAttendanceReport(
  sporcuId: number,
  opts?: { year?: number; month?: number; headers?: HeadersInit },
): Promise<MonthlyAttendanceReport> {
  const q = new URLSearchParams();
  if (opts?.year != null) q.set("year", String(opts.year));
  if (opts?.month != null) q.set("month", String(opts.month));
  const qs = q.toString();
  const res = await fetch(
    `${getApiBaseUrl()}/attendance/report/${sporcuId}${qs ? `?${qs}` : ""}`,
    withAuth({ cache: "no-store" }, opts?.headers),
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  return JSON.parse(text) as MonthlyAttendanceReport;
}

/** Backend'in urettigi QR URL yolunu, frontend ortamindaki API tabani ile eslestirir (mobil uyumluluk). */
export function resolveSporcuQrImageUrl(backendQrPngUrl: string): string {
  try {
    const path = new URL(backendQrPngUrl).pathname;
    return `${getApiBaseUrl()}${path}`;
  } catch {
    return backendQrPngUrl;
  }
}

export async function getVeliProfile(
  qrToken: string,
  opts?: { year?: number; month?: number },
): Promise<VeliProfileResponse> {
  const q = new URLSearchParams();
  if (opts?.year != null) q.set("year", String(opts.year));
  if (opts?.month != null) q.set("month", String(opts.month));
  const qs = q.toString();
  const enc = encodeURIComponent(qrToken.trim());
  const res = await fetch(`${getApiBaseUrl()}/veli/profil/${enc}${qs ? `?${qs}` : ""}`, { cache: "no-store" });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  return JSON.parse(text) as VeliProfileResponse;
}

export async function getVeliProfileMe(opts?: { year?: number; month?: number; headers?: HeadersInit }): Promise<VeliProfileResponse> {
  const q = new URLSearchParams();
  if (opts?.year != null) q.set("year", String(opts.year));
  if (opts?.month != null) q.set("month", String(opts.month));
  const qs = q.toString();
  const res = await fetch(
    `${getApiBaseUrl()}/veli/me/profil${qs ? `?${qs}` : ""}`,
    withAuth({ cache: "no-store" }, opts?.headers),
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  return JSON.parse(text) as VeliProfileResponse;
}

export async function listAnnouncements(opts?: { limit?: number; branch?: string }, auth?: AuthFetchOpts): Promise<AnnouncementOut[]> {
  const q = new URLSearchParams();
  if (opts?.limit != null) q.set("limit", String(opts.limit));
  if (opts?.branch?.trim()) q.set("branch", opts.branch.trim());
  const qs = q.toString();
  const res = await fetch(`${getApiBaseUrl()}/announcements${qs ? `?${qs}` : ""}`, withAuth({ cache: "no-store" }, auth?.headers));
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  return text ? (JSON.parse(text) as AnnouncementOut[]) : [];
}

export async function createAnnouncement(
  body: {
    title: string;
    content: string;
    target_branch?: string | null;
  },
  auth?: AuthFetchOpts,
): Promise<AnnouncementOut> {
  const res = await fetch(
    `${getApiBaseUrl()}/announcements`,
    withAuth(
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: body.title.trim(),
          content: body.content.trim(),
          target_branch: body.target_branch?.trim() || null,
        }),
      },
      auth?.headers,
    ),
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }
  return JSON.parse(text) as AnnouncementOut;
}

export interface FinanceDashboardSummary {
  total_pending_try: number;
  open_payment_count: number;
  debtors: {
    sporcu_id: number;
    full_name: string;
    sport_branch: string;
    open_items: number;
    balance_try: number;
  }[];
}

export interface PaymentOut {
  id: number;
  sporcu_id: number;
  title: string;
  amount_try: number;
  due_date: string;
  paid_at: string | null;
  status: "pending" | "paid";
  notes: string | null;
  created_at: string;
}

export async function listPayments(
  opts?: { sporcu_id?: number; status?: "pending" | "paid" },
  auth?: AuthFetchOpts,
): Promise<PaymentOut[]> {
  const q = new URLSearchParams();
  if (opts?.sporcu_id != null) q.set("sporcu_id", String(opts.sporcu_id));
  if (opts?.status) q.set("status", opts.status);
  const qs = q.toString();
  const res = await fetch(`${getApiBaseUrl()}/payments${qs ? `?${qs}` : ""}`, withAuth({ cache: "no-store" }, auth?.headers));
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return text ? (JSON.parse(text) as PaymentOut[]) : [];
}

export async function getFinanceDashboardSummary(auth?: AuthFetchOpts): Promise<FinanceDashboardSummary> {
  const res = await fetch(
    `${getApiBaseUrl()}/payments/dashboard-summary`,
    withAuth({ cache: "no-store" }, auth?.headers),
  );
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return JSON.parse(text) as FinanceDashboardSummary;
}

export async function markPaymentPaid(paymentId: number, auth?: AuthFetchOpts): Promise<unknown> {
  const res = await fetch(
    `${getApiBaseUrl()}/payments/${paymentId}/mark-paid`,
    withAuth({ method: "PATCH" }, auth?.headers),
  );
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return text ? JSON.parse(text) : null;
}

export interface ShopProductOut {
  id: number;
  name: string;
  description: string | null;
  price_try: number;
  stock: number;
  active: boolean;
  created_at: string;
}

export async function listShopProducts(): Promise<ShopProductOut[]> {
  const res = await fetch(`${getApiBaseUrl()}/shop/products`, { cache: "no-store" });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return text ? (JSON.parse(text) as ShopProductOut[]) : [];
}

export async function createShopOrder(body: {
  product_id: number;
  quantity: number;
  buyer_name: string;
  buyer_phone: string;
}): Promise<unknown> {
  const res = await fetch(`${getApiBaseUrl()}/shop/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return JSON.parse(text);
}

export interface SecondHandOut {
  id: number;
  title: string;
  description: string;
  price_try: number | null;
  contact_phone: string;
  sport_branch: string | null;
  status: string;
  created_at: string;
}

export async function listSecondHandListings(): Promise<SecondHandOut[]> {
  const res = await fetch(`${getApiBaseUrl()}/second-hand/listings?status=active`, { cache: "no-store" });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return text ? (JSON.parse(text) as SecondHandOut[]) : [];
}

export async function createSecondHandListing(body: {
  title: string;
  description: string;
  price_try?: number | null;
  contact_phone: string;
  sport_branch?: string | null;
}): Promise<SecondHandOut> {
  const res = await fetch(`${getApiBaseUrl()}/second-hand/listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return JSON.parse(text) as SecondHandOut;
}

export interface AthleteOfWeekOut {
  id: number;
  sporcu_id: number;
  week_start: string;
  note: string | null;
  created_at: string;
  sporcu_name: string | null;
  sport_branch: string | null;
}

export async function getCurrentAthleteOfWeek(auth?: AuthFetchOpts): Promise<AthleteOfWeekOut | null> {
  const res = await fetch(
    `${getApiBaseUrl()}/gamification/athlete-of-week/current`,
    withAuth({ cache: "no-store" }, auth?.headers),
  );
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  if (!text || text === "null") return null;
  return JSON.parse(text) as AthleteOfWeekOut;
}

export async function confirmVeliHomework(homeworkId: number, qrToken: string): Promise<HomeworkItem> {
  const res = await fetch(`${getApiBaseUrl()}/veli/homework/${homeworkId}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qr_token: qrToken.trim() }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return JSON.parse(text) as HomeworkItem;
}

export async function confirmVeliHomeworkJwt(homeworkId: number, auth?: AuthFetchOpts): Promise<HomeworkItem> {
  const res = await fetch(
    `${getApiBaseUrl()}/veli/me/homework/${homeworkId}/confirm`,
    withAuth({ method: "POST" }, auth?.headers),
  );
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return JSON.parse(text) as HomeworkItem;
}
