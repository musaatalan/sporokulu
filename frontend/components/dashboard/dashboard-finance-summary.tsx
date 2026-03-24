"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Banknote, Loader2 } from "lucide-react";

import { getFinanceDashboardSummary, type FinanceDashboardSummary } from "@/lib/api";
import { PanelCard } from "@/components/ui/panel-card";

export function DashboardFinanceSummary() {
  const [data, setData] = useState<FinanceDashboardSummary | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await getFinanceDashboardSummary();
        if (!cancelled) setData(s);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Özet yüklenemedi");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) {
    return (
      <PanelCard title="Finans" subtitle="Bekleyen ödemeler" icon={Banknote}>
        <p className="text-sm text-red-700">{err}</p>
      </PanelCard>
    );
  }

  if (!data) {
    return (
      <PanelCard title="Finans" subtitle="Bekleyen ödemeler" icon={Banknote}>
        <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" aria-hidden />
          Özet yükleniyor…
        </div>
      </PanelCard>
    );
  }

  return (
    <PanelCard title="Finans" subtitle="Ödenmemiş aidat ve açık kalemler" icon={Banknote}>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/50 px-4 py-3 ring-1 ring-emerald-100/80">
          <dt className="text-xs font-medium text-emerald-800/80">Toplam bekleyen</dt>
          <dd className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{data.total_pending_try.toFixed(2)} ₺</dd>
        </div>
        <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
          <dt className="text-xs font-medium text-slate-500">Açık kalem</dt>
          <dd className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{data.open_payment_count}</dd>
        </div>
      </dl>
      {data.debtors.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">Bekleyen ödeme kaydı yok.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100 bg-slate-50/50">
          <table className="w-full min-w-[280px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-white/90 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2.5">Sporcu</th>
                <th className="px-3 py-2.5 text-right">Bakiye</th>
                <th className="px-3 py-2.5 w-16" />
              </tr>
            </thead>
            <tbody>
              {data.debtors.slice(0, 5).map((d) => (
                <tr key={d.sporcu_id} className="border-b border-slate-100 bg-white/60 last:border-0">
                  <td className="px-3 py-2">
                    <span className="font-medium text-slate-900">{d.full_name}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{d.sport_branch}</span>
                  </td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums text-slate-900">
                    {d.balance_try.toFixed(2)} ₺
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/dashboard/sporcu/${d.sporcu_id}#odemeler`}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      Aç
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.debtors.length > 5 && (
            <p className="border-t border-slate-100 bg-white/80 px-3 py-2 text-center text-xs text-slate-500">
              +{data.debtors.length - 5} sporcu daha — detaylar için sporcu kartlarına gidin
            </p>
          )}
        </div>
      )}
    </PanelCard>
  );
}
