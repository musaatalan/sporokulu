"use client";

import { useEffect, useState } from "react";
import { Loader2, Recycle, RefreshCw } from "lucide-react";

import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { createSecondHandListing, listSecondHandListings, type SecondHandOut } from "@/lib/api";

export default function SecondHandPage() {
  const [listings, setListings] = useState<SecondHandOut[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price_try: "",
    contact_phone: "",
    sport_branch: "",
  });
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const l = await listSecondHandListings();
      setListings(l);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "İlanlar yüklenemedi");
      setListings([]);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.contact_phone.trim()) return;
    setBusy(true);
    try {
      await createSecondHandListing({
        title: form.title.trim(),
        description: form.description.trim(),
        contact_phone: form.contact_phone.trim(),
        price_try: form.price_try.trim() ? Number(form.price_try) : null,
        sport_branch: form.sport_branch.trim() || null,
      });
      setForm({ title: "", description: "", price_try: "", contact_phone: "", sport_branch: "" });
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Kayıt başarısız");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <PanelPageHeader
        eyebrow="İkinci el"
        title="İlan panosu"
        description="Üyeler arası ekipman paylaşımı. Alışveriş güvenliği taraflara aittir; kulüp aracılık etmez."
        icon={Recycle}
      />
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => refresh()}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm hover:bg-emerald-50"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Listeyi yenile
        </button>
      </div>

      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">Yeni ilan</h2>
        <form onSubmit={submit} className="mt-4 grid gap-3">
          <label className="text-sm">
            <span className="text-slate-500">Başlık</span>
            <input
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            <span className="text-slate-500">Açıklama</span>
            <textarea
              required
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="text-slate-500">Fiyat (₺, isteğe bağlı)</span>
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.price_try}
                onChange={(e) => setForm((f) => ({ ...f, price_try: e.target.value }))}
              />
            </label>
            <label className="text-sm">
              <span className="text-slate-500">İletişim telefonu</span>
              <input
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                value={form.contact_phone}
                onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
              />
            </label>
          </div>
          <label className="text-sm">
            <span className="text-slate-500">Branş (isteğe bağlı)</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={form.sport_branch}
              onChange={(e) => setForm((f) => ({ ...f, sport_branch: e.target.value }))}
              placeholder="Futbol, Basketbol…"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {busy ? "Kaydediliyor…" : "İlanı yayınla"}
          </button>
        </form>
      </section>

      {err && <p className="mb-4 text-sm text-red-700">{err}</p>}

      <section>
        <h2 className="text-sm font-semibold text-slate-900">Aktif ilanlar</h2>
        {listings === null ? (
          <div className="mt-4 flex items-center gap-2 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Yükleniyor…
          </div>
        ) : listings.length === 0 ? (
          <p className="mt-4 text-slate-600">Henüz ilan yok.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {listings.map((x) => (
              <li key={x.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="font-semibold text-slate-900">{x.title}</p>
                <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{x.description}</p>
                <p className="mt-2 text-sm">
                  {x.price_try != null ? (
                    <span className="font-mono font-semibold text-emerald-800">{x.price_try.toFixed(2)} ₺</span>
                  ) : (
                    <span className="text-slate-500">Fiyat: görüşülür</span>
                  )}
                  {x.sport_branch && <span className="ml-2 text-slate-500">· {x.sport_branch}</span>}
                </p>
                <p className="mt-1 text-xs text-slate-500">Tel: {x.contact_phone}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
