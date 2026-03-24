"use client";

import { useEffect, useState } from "react";
import { Loader2, Trophy } from "lucide-react";

import { getCurrentAthleteOfWeek, type AthleteOfWeekOut } from "@/lib/api";
import { PanelCard } from "@/components/ui/panel-card";

export function DashboardAthleteOfWeek() {
  const [row, setRow] = useState<AthleteOfWeekOut | null | undefined>(undefined);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const a = await getCurrentAthleteOfWeek();
        if (!cancelled) setRow(a);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Yüklenemedi");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) {
    return (
      <PanelCard title="Haftanın sporcusu" subtitle="Özet yüklenemedi" icon={Trophy} accent="amber">
        <p className="text-sm text-amber-900/90">{err}</p>
      </PanelCard>
    );
  }

  if (row === undefined) {
    return (
      <PanelCard title="Haftanın sporcusu" subtitle="Kulüp seçimi" icon={Trophy} accent="amber">
        <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" aria-hidden />
          Yükleniyor…
        </div>
      </PanelCard>
    );
  }

  if (!row) {
    return (
      <PanelCard title="Haftanın sporcusu" subtitle="Bu hafta henüz ilan edilmedi" icon={Trophy} accent="amber">
        <p className="py-4 text-sm text-slate-600">Antrenör ekibi ödülü yakında paylaşacak.</p>
      </PanelCard>
    );
  }

  return (
    <PanelCard title="Haftanın sporcusu" subtitle={`Hafta: ${row.week_start}`} icon={Trophy} accent="amber">
      <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 ring-1 ring-amber-100/80">
        <p className="text-lg font-bold text-slate-900">{row.sporcu_name ?? `Sporcu #${row.sporcu_id}`}</p>
        {row.sport_branch ? <p className="mt-1 text-sm text-slate-600">{row.sport_branch}</p> : null}
        {row.note ? <p className="mt-3 text-sm leading-relaxed text-slate-700">{row.note}</p> : null}
      </div>
    </PanelCard>
  );
}
