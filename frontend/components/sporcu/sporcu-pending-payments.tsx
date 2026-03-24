"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { listPayments, markPaymentPaid, type PaymentOut } from "@/lib/api";

type Props = { sporcuId: number };

export function SporcuPendingPayments({ sporcuId }: Props) {
  const [items, setItems] = useState<PaymentOut[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const list = await listPayments({ sporcu_id: sporcuId, status: "pending" });
      setItems(list);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ödemeler yüklenemedi");
      setItems([]);
    }
  }, [sporcuId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function markPaid(id: number) {
    setBusy(id);
    try {
      await markPaymentPaid(id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "İşlem başarısız");
    } finally {
      setBusy(null);
    }
  }

  if (err) {
    return (
      <p id="odemeler" className="text-sm text-amber-800">
        {err}
      </p>
    );
  }
  if (!items) {
    return (
      <div id="odemeler" className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Ödemeler yükleniyor…
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <p id="odemeler" className="text-sm text-slate-600">
        Bekleyen ödeme kalemi yok.
      </p>
    );
  }

  return (
    <ul id="odemeler" className="space-y-3">
      {items.map((p) => (
        <li key={p.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">{p.title}</p>
            <p className="text-xs text-slate-500">
              Vade: {p.due_date} · <span className="font-mono font-medium text-slate-800">{p.amount_try.toFixed(2)} ₺</span>
            </p>
            {p.notes && <p className="mt-1 text-xs text-slate-600">{p.notes}</p>}
          </div>
          <button
            type="button"
            disabled={busy === p.id}
            onClick={() => markPaid(p.id)}
            className="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Ödendi işaretle
          </button>
        </li>
      ))}
    </ul>
  );
}
