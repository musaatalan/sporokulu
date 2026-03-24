"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck, Users } from "lucide-react";

import { getAttendanceToday, listSporcular } from "@/lib/api";
import { AttendanceParticipationDonut } from "@/components/sporcu/attendance-participation-donut";
import { PanelCard } from "@/components/ui/panel-card";

export function DashboardAttendanceStats() {
  const [today, setToday] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    function load() {
      Promise.all([getAttendanceToday(), listSporcular()])
        .then(([t, sporcular]) => {
          if (!cancelled) {
            setToday(t.distinct_arrived_today);
            setTotal(sporcular.length);
            setErr(null);
          }
        })
        .catch((e) => {
          if (!cancelled) setErr(e instanceof Error ? e.message : "Özet yüklenemedi");
        });
    }

    load();
    const onChange = () => load();
    window.addEventListener("sporokulu:attendance-changed", onChange);
    return () => {
      cancelled = true;
      window.removeEventListener("sporokulu:attendance-changed", onChange);
    };
  }, []);

  const pct =
    total != null && total > 0 && today != null ? Math.min(100, Math.round((today / total) * 100)) : 0;

  if (err) {
    return (
      <PanelCard title="Yoklama özeti" subtitle="Bugünkü katılım" icon={ClipboardCheck}>
        <p className="text-sm text-red-700">{err}</p>
      </PanelCard>
    );
  }

  return (
    <PanelCard title="Yoklama özeti" subtitle="Kayıtlı üyelere göre bugün tesiste görünenler" icon={ClipboardCheck}>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <AttendanceParticipationDonut participationPct={pct} />
        <div className="grid w-full max-w-xs flex-1 gap-3 sm:max-w-none">
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50/80 px-4 py-3 ring-1 ring-emerald-100/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <ClipboardCheck className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-800/80">Bugün gelen</p>
              <p className="text-xl font-bold tabular-nums text-slate-900">{today ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-600 text-white">
              <Users className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Kayıtlı sporcu</p>
              <p className="text-xl font-bold tabular-nums text-slate-900">{total ?? "—"}</p>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-[11px] text-slate-400">Halka: kayıtlı üye içinde bugünkü gelen oranı (yaklaşık)</p>
    </PanelCard>
  );
}
