"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Footprints, LayoutGrid, Loader2, Search, User, ChevronRight, Sparkles } from "lucide-react";

import { listPerformances, listSporcular } from "@/lib/api";
import type { PerformanceOut } from "@/lib/types/performance";
import type { SporcuOut } from "@/lib/types/sporcu";
import {
  RADAR_AXIS_LABELS,
  emptyRadarPlaceholder,
  performanceScore,
  performanceToRadarValues,
} from "@/lib/radar-scores";
import { MiniRadar } from "@/components/sporcu/mini-radar";
import { PanelCard } from "@/components/ui/panel-card";

function dominantFootLabel(v: SporcuOut["dominant_foot"]): string {
  if (v === "sag") return "Sağ ayak";
  if (v === "sol") return "Sol ayak";
  if (v === "iki_ayak") return "İki ayak";
  return "—";
}

export function SporcuDashboardClient() {
  const [items, setItems] = useState<SporcuOut[]>([]);
  const [perfBySporcuId, setPerfBySporcuId] = useState<Map<number, PerformanceOut>>(new Map());
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    Promise.all([listSporcular(), listPerformances()])
      .then(([sporcular, performances]) => {
        if (cancelled) return;
        const m = new Map<number, PerformanceOut>();
        for (const p of performances) m.set(p.sporcu_id, p);
        setPerfBySporcuId(m);
        setItems(sporcular);
      })
      .catch((e) => {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Veri yüklenemedi.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((s) => {
      const name = s.full_name.toLowerCase();
      const pos = (s.position ?? "").toLowerCase();
      return name.includes(q) || pos.includes(q);
    });
  }, [items, query]);

  return (
    <PanelCard title="Sporcu listesi" subtitle="Performans radarı ve hızlı erişim" icon={Sparkles}>
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="İsim veya mevki ile ara…"
          className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3.5 pl-12 pr-4 text-sm text-slate-900 shadow-inner outline-none ring-emerald-500/20 transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4"
          aria-label="Sporcu ara"
        />
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-emerald-200/80 bg-emerald-50/30 py-16 text-slate-600">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" aria-hidden />
          <p className="text-sm font-medium">Sporcular yükleniyor…</p>
        </div>
      )}

      {!loading && err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
          <p className="font-semibold">Bağlantı sorunu</p>
          <p className="mt-1 opacity-90">{err}</p>
        </div>
      )}

      {!loading && !err && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-14 text-center">
          <LayoutGrid className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
          <p className="mt-3 font-semibold text-slate-800">{items.length === 0 ? "Henüz sporcu yok" : "Eşleşen sporcu yok"}</p>
          <p className="mt-2 text-sm text-slate-600">
            {items.length === 0 ? (
              <>
                <Link href="/kayit" className="font-semibold text-emerald-700 underline-offset-2 hover:underline">
                  Yeni sporcu kaydı
                </Link>{" "}
                ile başlayın.
              </>
            ) : (
              "Aramayı değiştirmeyi deneyin."
            )}
          </p>
        </div>
      )}

      {!loading && !err && filtered.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => {
            const perf = perfBySporcuId.get(s.id);
            const radar = perf ? performanceToRadarValues(perf) : emptyRadarPlaceholder();
            const scoreLabel = perf ? performanceScore(perf) : "—";
            return (
              <li key={s.id}>
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-100/80 bg-gradient-to-b from-white to-emerald-50/20 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
                  <div className="flex flex-1 gap-4 p-5">
                    <div className="flex shrink-0 flex-col items-center gap-2">
                      <MiniRadar values={radar} size={96} className="shrink-0 text-emerald-600" />
                      <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold tabular-nums text-white shadow-sm">
                        {perf ? `Puan ${scoreLabel}` : "Radar"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div>
                        <h3 className="flex items-start gap-2 font-semibold text-slate-900">
                          <User className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                          <span className="line-clamp-2 leading-snug">{s.full_name}</span>
                        </h3>
                        <p className="mt-1 truncate text-xs font-medium text-emerald-700/80">{s.sport_branch}</p>
                      </div>
                      <dl className="grid gap-1.5 text-xs text-slate-600">
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-400">Mevki</dt>
                          <dd className="truncate font-medium text-slate-800">{s.position?.trim() || "—"}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="flex items-center gap-1 text-slate-400">
                            <Footprints className="h-3 w-3" aria-hidden />
                            Ayak
                          </dt>
                          <dd className="shrink-0 font-medium text-slate-800">{dominantFootLabel(s.dominant_foot)}</dd>
                        </div>
                      </dl>
                      {perf ? (
                        <ul className="flex flex-wrap gap-x-2 gap-y-1 border-t border-emerald-100/60 pt-2 text-[10px] text-slate-500">
                          {RADAR_AXIS_LABELS.map((a, i) => (
                            <li key={a} className="rounded-md bg-white/80 px-1.5 py-0.5 ring-1 ring-slate-100">
                              {a}{" "}
                              <span className="font-mono font-semibold text-emerald-800">
                                {[perf.hiz, perf.teknik, perf.sut, perf.pas, perf.fizik][i]}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="border-t border-emerald-100/60 pt-2 text-[11px] italic text-slate-400">
                          Performans henüz girilmemiş.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-emerald-100/80 bg-emerald-600/5 px-5 py-3">
                    <Link
                      href={`/dashboard/sporcu/${s.id}`}
                      className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700"
                    >
                      Profili aç
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </PanelCard>
  );
}
