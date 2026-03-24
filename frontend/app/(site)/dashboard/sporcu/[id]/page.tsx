import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Footprints, PieChart, QrCode, User, Video } from "lucide-react";

import { getMonthlyAttendanceReport, getPerformanceForSporcu, getSporcu, sporcuQrPngUrl } from "@/lib/api";
import { getServerAuthHeaders } from "@/lib/auth-server";
import { NutritionBlock } from "@/components/content/nutrition-block";
import { ProfileVideoFrame } from "@/components/content/profile-video-frame";
import { SporcuPendingPayments } from "@/components/sporcu/sporcu-pending-payments";
import {
  RADAR_AXIS_LABELS,
  emptyRadarPlaceholder,
  performanceScore,
  performanceToRadarValues,
} from "@/lib/radar-scores";
import { AttendanceParticipationDonut } from "@/components/sporcu/attendance-participation-donut";
import { MiniRadar } from "@/components/sporcu/mini-radar";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = Number(params.id);
  if (!Number.isFinite(id)) return { title: "Sporcu" };
  try {
    const s = await getSporcu(id, { headers: getServerAuthHeaders() });
    return { title: `${s.full_name} | Panel` };
  } catch {
    return { title: "Sporcu bulunamadı" };
  }
}

function footLabel(v: string | null): string {
  if (v === "sag") return "Sağ ayak";
  if (v === "sol") return "Sol ayak";
  if (v === "iki_ayak") return "İki ayak";
  return "—";
}

export default async function SporcuDetailPage({ params }: Props) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  let s;
  const authH = getServerAuthHeaders();
  try {
    s = await getSporcu(id, { headers: authH });
  } catch {
    notFound();
  }

  const perf = await getPerformanceForSporcu(id, { headers: authH });
  const radar = perf ? performanceToRadarValues(perf) : emptyRadarPlaceholder();
  const score = perf ? performanceScore(perf) : null;
  const qrSrc = sporcuQrPngUrl(s.id);
  const attendanceReport = await getMonthlyAttendanceReport(id, { headers: authH });
  const hasAcademic =
    s.math_grade != null || s.turkish_grade != null || (s.academic_notes && s.academic_notes.trim().length > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Panele dön
      </Link>

      <article className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 to-white px-6 py-5">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <User className="h-7 w-7 text-emerald-600" aria-hidden />
            {s.full_name}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{s.sport_branch}</p>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-start">
          <div className="flex flex-col items-center gap-3">
            <MiniRadar values={radar} size={140} className="text-emerald-600" />
            <p className="text-center text-xs text-slate-500">
              {perf ? "Performans özeti (1–10 skalası, grafik 0–100)" : "Performans kaydı henüz yok"}
            </p>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold tabular-nums text-emerald-900">
              {perf ? `Performans puanı: ${score}` : "Puan: —"}
            </span>
          </div>
          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-slate-100 py-2">
              <dt className="text-slate-500">Mevki</dt>
              <dd className="font-medium text-slate-900">{s.position?.trim() || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-slate-100 py-2">
              <dt className="flex items-center gap-1 text-slate-500">
                <Footprints className="h-4 w-4" aria-hidden />
                Baskın ayak
              </dt>
              <dd className="font-medium text-slate-900">{footLabel(s.dominant_foot)}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Eksen değerleri (1–10)</p>
              {perf ? (
                <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                  {RADAR_AXIS_LABELS.map((a, i) => {
                    const vals = [perf.hiz, perf.teknik, perf.sut, perf.pas, perf.fizik];
                    return (
                      <li key={a}>
                        {a}: <span className="font-mono font-medium text-slate-900">{vals[i]}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-2 text-slate-500">Performans kaydı antrenör ekibi tarafından eklenebilir.</p>
              )}
            </div>
          </dl>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/40 px-6 py-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <PieChart className="h-5 w-5 text-emerald-600" aria-hidden />
            Gelişim özeti — devamsızlık (bu ay)
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Antrenman günü: o gün en az bir sporcu &quot;geldi&quot; veya &quot;geç&quot; olarak kayıtlıysa sayılır. Katılım = bu
            sporcunun o günlerdeki varlığı / antrenman günü.
          </p>
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <AttendanceParticipationDonut participationPct={attendanceReport.participation_rate_pct} />
            <dl className="grid flex-1 gap-2 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Dönem</dt>
                <dd className="font-medium text-slate-900">
                  {attendanceReport.year}-{String(attendanceReport.month).padStart(2, "0")}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Antrenman günü (tesis)</dt>
                <dd className="font-medium tabular-nums text-slate-900">{attendanceReport.training_days}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Sporcunun geldiği gün</dt>
                <dd className="font-medium tabular-nums text-slate-900">{attendanceReport.present_days}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Kaçırılan (tahmini)</dt>
                <dd className="font-medium tabular-nums text-slate-900">{attendanceReport.missed_days}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Kayıt (geldi+geç / gelmedi)</dt>
                <dd className="font-medium tabular-nums text-slate-900">
                  {attendanceReport.records_present} / {attendanceReport.records_absent}
                </dd>
              </div>
              {attendanceReport.absent_rate_pct != null && (
                <div className="flex justify-between gap-4">
                  <dt>Devamsızlık yüzdesi</dt>
                  <dd className="font-medium tabular-nums text-amber-800">{attendanceReport.absent_rate_pct}%</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {hasAcademic && (
          <div className="border-t border-slate-100 bg-white px-6 py-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <BookOpen className="h-5 w-5 text-indigo-600" aria-hidden />
              Akademik notlar
            </h2>
            <dl className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              {s.math_grade != null && (
                <div className="flex justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  <dt>Matematik (0–100)</dt>
                  <dd className="font-semibold text-slate-900">{s.math_grade}</dd>
                </div>
              )}
              {s.turkish_grade != null && (
                <div className="flex justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  <dt>Türkçe (0–100)</dt>
                  <dd className="font-semibold text-slate-900">{s.turkish_grade}</dd>
                </div>
              )}
            </dl>
            {s.academic_notes && s.academic_notes.trim() && (
              <p className="mt-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-sm text-slate-700">
                {s.academic_notes}
              </p>
            )}
          </div>
        )}

        <div className="border-t border-slate-100 bg-white px-6 py-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <QrCode className="h-5 w-5 text-emerald-600" aria-hidden />
            Sporcu QR kodu
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Veli bilgi sayfasına (`/veli/…`) gider.             Bağlantı kulüp tarafından yapılandırılır.
          </p>
          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc}
              alt={`${s.full_name} için QR kodu`}
              width={200}
              height={200}
              className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
            />
            <div className="min-w-0 flex-1 text-xs text-slate-600">
              <p className="font-medium text-slate-700">Hedef bağlantı</p>
              <p className="mt-1 break-all rounded-lg bg-slate-50 p-2 font-mono text-[11px] text-slate-800">
                {s.qr_target_url ?? "—"}
              </p>
            </div>
          </div>
        </div>

        {(s.profile_video_url?.trim() || s.nutrition_plan_text?.trim()) && (
          <div className="border-t border-slate-100 bg-white px-6 py-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Video className="h-5 w-5 text-emerald-600" aria-hidden />
              Video ve beslenme
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Video için YouTube bağlantısı kullanın. Beslenme tablosunda sütunları dikey çizgi ( | ) ile ayırın.
            </p>
            <div className="mt-4 space-y-6">
              <ProfileVideoFrame url={s.profile_video_url} />
              {s.nutrition_plan_text?.trim() && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Beslenme tablosu</p>
                  <NutritionBlock text={s.nutrition_plan_text.trim()} />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-6">
          <h2 className="text-sm font-semibold text-slate-900">Bekleyen ödemeler</h2>
          <p className="mt-1 text-xs text-slate-500">Aidat ve diğer kalemler. Ödendi işaretleyince kayıt kapanır.</p>
          <div className="mt-4">
            <SporcuPendingPayments sporcuId={id} />
          </div>
        </div>
      </article>
    </div>
  );
}
