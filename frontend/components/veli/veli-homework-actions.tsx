"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { confirmVeliHomework, confirmVeliHomeworkJwt } from "@/lib/api";
import type { HomeworkItem } from "@/lib/types/veli-profile";

type Props =
  | { mode: "qr"; qrToken: string; items: HomeworkItem[] }
  | { mode: "jwt"; items: HomeworkItem[] };

export function VeliHomeworkActions(props: Props) {
  const items = props.items;
  const [busy, setBusy] = useState<number | null>(null);
  const [local, setLocal] = useState<HomeworkItem[]>(items);

  async function confirm(id: number) {
    setBusy(id);
    try {
      const updated =
        props.mode === "qr"
          ? await confirmVeliHomework(id, props.qrToken)
          : await confirmVeliHomeworkJwt(id);
      setLocal((prev) => prev.map((h) => (h.id === id ? { ...h, parent_confirmed_at: updated.parent_confirmed_at } : h)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Onaylanamadı");
    } finally {
      setBusy(null);
    }
  }

  if (local.length === 0) {
    return <p className="text-sm text-slate-500">Şu an gösterilecek günlük ödev kaydı yok.</p>;
  }

  return (
    <ul className="space-y-3">
      {local.map((h) => (
        <li key={h.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-semibold text-slate-900">{h.title}</p>
          {h.description && <p className="mt-1 text-sm text-slate-600">{h.description}</p>}
          <p className="mt-2 text-xs text-slate-500">
            Tarih: {h.assigned_for_date}
            {h.parent_confirmed_at && (
              <span className="ml-2 inline-flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                Veli onayı alındı
              </span>
            )}
          </p>
          {!h.parent_confirmed_at && (
            <button
              type="button"
              disabled={busy === h.id}
              onClick={() => confirm(h.id)}
              className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 sm:w-auto"
            >
              {busy === h.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Tamamlandı olarak işaretle
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
