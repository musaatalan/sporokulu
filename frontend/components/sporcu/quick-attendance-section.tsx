"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, ClipboardCheck, Loader2 } from "lucide-react";

import { listSporcular, postManualAttendance } from "@/lib/api";
import type { SporcuOut } from "@/lib/types/sporcu";
import { PanelCard } from "@/components/ui/panel-card";

function notifyAttendanceChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sporokulu:attendance-changed"));
  }
}

export function QuickAttendanceSection() {
  const [open, setOpen] = useState(true);
  const [items, setItems] = useState<SporcuOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rowMsg, setRowMsg] = useState<Record<number, string>>({});

  const load = useCallback(() => {
    setLoading(true);
    setLoadErr(null);
    listSporcular({ active_only: true })
      .then(setItems)
      .catch((e) => setLoadErr(e instanceof Error ? e.message : "Liste alınamadı"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (open) {
      load();
    }
  }, [open, load]);

  async function mark(id: number, status: "geldi" | "gelmedi" | "gec") {
    setBusyId(id);
    setRowMsg((m) => ({ ...m, [id]: "" }));
    try {
      await postManualAttendance(id, status);
      setRowMsg((m) => ({ ...m, [id]: "Kaydedildi" }));
      notifyAttendanceChanged();
      window.setTimeout(() => setRowMsg((m) => ({ ...m, [id]: "" })), 2500);
    } catch (e) {
      setRowMsg((m) => ({ ...m, [id]: e instanceof Error ? e.message : "Hata" }));
    } finally {
      setBusyId(null);
    }
  }

  const toggle = (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-800"
      aria-expanded={open}
    >
      {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
    </button>
  );

  return (
    <div className="mb-10">
      <PanelCard
        title="Hızlı yoklama"
        subtitle="Aktif sporcular için geldi / geç / gelmedi kaydı"
        icon={ClipboardCheck}
        headerAction={toggle}
      >
        {open && (
          <div>
            <p className="mb-4 text-sm text-slate-600">
              Listeden seçim yapın. <span className="font-medium text-slate-800">Yok</span> gelmedi olarak işlenir.
            </p>
            {loading && (
              <div className="flex items-center gap-2 py-10 text-slate-600">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-600" aria-hidden />
                Liste yükleniyor…
              </div>
            )}
            {loadErr && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{loadErr}</p>}
            {!loading && !loadErr && items.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">Aktif sporcu bulunmuyor.</p>
            )}
            {!loading && !loadErr && items.length > 0 && (
              <ul className="max-h-[min(60vh,28rem)] space-y-2 overflow-y-auto pr-1">
                {items.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-col gap-2 rounded-xl border border-emerald-100/80 bg-emerald-50/20 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{s.full_name}</p>
                      <p className="text-xs text-slate-500">{s.sport_branch}</p>
                      {rowMsg[s.id] ? <p className="mt-1 text-xs font-medium text-emerald-700">{rowMsg[s.id]}</p> : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyId === s.id}
                        onClick={() => mark(s.id, "geldi")}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Geldi
                      </button>
                      <button
                        type="button"
                        disabled={busyId === s.id}
                        onClick={() => mark(s.id, "gec")}
                        className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                      >
                        Geç
                      </button>
                      <button
                        type="button"
                        disabled={busyId === s.id}
                        onClick={() => mark(s.id, "gelmedi")}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Yok
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {!open && <p className="text-sm text-slate-500">Listeyi göstermek için genişletin.</p>}
      </PanelCard>
    </div>
  );
}
