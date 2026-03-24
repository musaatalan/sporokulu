import {
  Activity,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Footprints,
  Megaphone,
  QrCode,
  Trophy,
  User,
  Video,
} from "lucide-react";

import type { VeliProfileResponse } from "@/lib/types/veli-profile";
import { resolveSporcuQrImageUrl } from "@/lib/api";
import { NutritionBlock } from "@/components/content/nutrition-block";
import { ProfileVideoFrame } from "@/components/content/profile-video-frame";
import { VeliHomeworkActions } from "@/components/veli/veli-homework-actions";
import { AttendanceParticipationDonut } from "@/components/sporcu/attendance-participation-donut";
import { MiniRadar } from "@/components/sporcu/mini-radar";
import { PanelCard } from "@/components/ui/panel-card";
import {
  RADAR_AXIS_LABELS,
  emptyRadarPlaceholder,
  performanceToRadarValues,
} from "@/lib/radar-scores";

function footLabel(v: string | null): string {
  if (v === "sag") return "Sağ ayak";
  if (v === "sol") return "Sol ayak";
  if (v === "iki_ayak") return "İki ayak";
  return "—";
}

type HomeworkMode = { mode: "qr"; qrToken: string } | { mode: "jwt" };

export function VeliProfileBody({
  data,
  homeworkMode,
  hideHeroName = false,
}: {
  data: VeliProfileResponse;
  homeworkMode: HomeworkMode;
  /** Üst sayfada isim gösterildiyse (veli paneli) tekrar büyük başlık gösterme */
  hideHeroName?: boolean;
}) {
  const { sporcu, performance, attendance_month, announcements, homework, is_athlete_of_week, athlete_of_week_note } =
    data;
  const radar = performance ? performanceToRadarValues(performance) : emptyRadarPlaceholder();
  const qrImgSrc = resolveSporcuQrImageUrl(sporcu.qr_png_url);
  const monthLabel = `${attendance_month.year}-${String(attendance_month.month).padStart(2, "0")}`;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid gap-5 lg:grid-cols-3 lg:items-stretch">
        <PanelCard
          title={hideHeroName ? "Genel bilgi" : sporcu.full_name}
          subtitle={hideHeroName ? sporcu.full_name : sporcu.sport_branch}
          icon={User}
        >
          {!hideHeroName && <p className="mb-3 text-sm font-medium text-emerald-800">{sporcu.sport_branch}</p>}
          <dl className="grid gap-2 text-sm text-slate-600">
            <div className="flex justify-between gap-2 border-b border-emerald-50 pb-2">
              <dt className="text-slate-500">Mevki</dt>
              <dd className="font-medium text-slate-900">{sporcu.position?.trim() || "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="flex items-center gap-1 text-slate-500">
                <Footprints className="h-3.5 w-3.5" aria-hidden />
                Baskın ayak
              </dt>
              <dd className="font-medium text-slate-900">{footLabel(sporcu.dominant_foot)}</dd>
            </div>
          </dl>
          {is_athlete_of_week && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/50 p-3 ring-1 ring-amber-100/60">
              <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-900">Haftanın sporcusu</p>
                {athlete_of_week_note && <p className="mt-1 text-sm text-amber-950/90">{athlete_of_week_note}</p>}
              </div>
            </div>
          )}
        </PanelCard>

        <PanelCard title="Performans" subtitle="Antrenör değerlendirmesi (radar)" icon={Activity}>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
            <MiniRadar values={radar} size={140} className="shrink-0 text-emerald-600" />
            <ul className="w-full max-w-[220px] text-xs text-slate-600">
              {RADAR_AXIS_LABELS.map((label, i) => (
                <li key={label} className="flex justify-between border-b border-slate-100 py-1.5 last:border-0">
                  <span>{label}</span>
                  <span className="font-mono font-semibold text-emerald-800">
                    {performance ? [performance.hiz, performance.teknik, performance.sut, performance.pas, performance.fizik][i] : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </PanelCard>

        <PanelCard title="Bu ay katılım" subtitle={`Dönem ${monthLabel}`} icon={CalendarDays}>
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
            <AttendanceParticipationDonut participationPct={attendance_month.participation_rate_pct} />
            <dl className="grid w-full flex-1 gap-2 text-sm text-slate-600">
              <div className="flex justify-between gap-2">
                <dt>Antrenman günü</dt>
                <dd className="font-semibold tabular-nums text-slate-900">{attendance_month.training_days}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Geldiği gün</dt>
                <dd className="font-semibold tabular-nums text-slate-900">{attendance_month.present_days}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Var / yok kayıtları</dt>
                <dd className="tabular-nums text-slate-900">
                  {attendance_month.records_present} / {attendance_month.records_absent}
                </dd>
              </div>
            </dl>
          </div>
        </PanelCard>
      </div>

      {(sporcu.profile_video_url?.trim() || sporcu.nutrition_plan_text?.trim()) && (
        <PanelCard title="Video ve beslenme" subtitle="Kulübün paylaştığı içerikler" icon={Video}>
          <ProfileVideoFrame url={sporcu.profile_video_url} />
          {sporcu.nutrition_plan_text?.trim() && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Beslenme planı</p>
              <NutritionBlock text={sporcu.nutrition_plan_text.trim()} />
            </div>
          )}
        </PanelCard>
      )}

      <PanelCard title="Günlük ödevler" subtitle="Tamamlayınca işaretleyin" icon={ClipboardList}>
        {homeworkMode.mode === "qr" ? (
          <VeliHomeworkActions mode="qr" qrToken={homeworkMode.qrToken} items={homework} />
        ) : (
          <VeliHomeworkActions mode="jwt" items={homework} />
        )}
      </PanelCard>

      {(sporcu.math_grade != null ||
        sporcu.turkish_grade != null ||
        (sporcu.academic_notes && sporcu.academic_notes.trim())) && (
        <PanelCard title="Akademik notlar" subtitle="Okul başarısı" icon={BookOpen} accent="slate">
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            {sporcu.math_grade != null && (
              <div className="rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
                <p className="text-xs text-slate-500">Matematik</p>
                <p className="text-lg font-bold text-slate-900">{sporcu.math_grade}</p>
              </div>
            )}
            {sporcu.turkish_grade != null && (
              <div className="rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
                <p className="text-xs text-slate-500">Türkçe</p>
                <p className="text-lg font-bold text-slate-900">{sporcu.turkish_grade}</p>
              </div>
            )}
          </div>
          {sporcu.academic_notes && sporcu.academic_notes.trim() && (
            <p className="mt-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-sm leading-relaxed text-slate-700">
              {sporcu.academic_notes}
            </p>
          )}
        </PanelCard>
      )}

      <PanelCard title="QR kod" subtitle="Tesis girişinde hızlı yoklama" icon={QrCode} accent="slate">
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrImgSrc}
            alt="Sporcu QR kodu"
            width={200}
            height={200}
            className="rounded-xl border border-slate-200 bg-white p-2 shadow-md"
          />
        </div>
      </PanelCard>

      {announcements.length > 0 && (
        <PanelCard title="Kulüp duyuruları" subtitle="Size özel filtrelenmiş liste" icon={Megaphone} accent="amber">
          <ul className="space-y-3">
            {announcements.map((a) => (
              <li key={a.id} className="rounded-xl border border-amber-100/90 bg-gradient-to-b from-white to-amber-50/20 p-4 shadow-sm">
                <p className="font-semibold text-slate-900">{a.title}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{a.content}</p>
                <p className="mt-2 text-[10px] font-medium text-slate-400">
                  {a.target_branch ? `${a.target_branch} · ` : "Tüm kulüp · "}
                  {new Date(a.created_at).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                </p>
              </li>
            ))}
          </ul>
        </PanelCard>
      )}
    </div>
  );
}
