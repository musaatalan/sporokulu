"use client";

import { useEffect, useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";

import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { createShopOrder, listShopProducts, type ShopProductOut } from "@/lib/api";

export default function ShopPage() {
  const [products, setProducts] = useState<ShopProductOut[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [qty, setQty] = useState<Record<number, number>>({});
  const [buyer, setBuyer] = useState({ name: "", phone: "" });

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const list = await listShopProducts();
        if (!c) {
          setProducts(list);
          const q: Record<number, number> = {};
          for (const p of list) q[p.id] = 1;
          setQty(q);
        }
      } catch (e) {
        if (!c) setErr(e instanceof Error ? e.message : "Ürünler alınamadı");
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  async function orderProduct(p: ShopProductOut) {
    const q = Math.max(1, qty[p.id] ?? 1);
    if (!buyer.name.trim() || !buyer.phone.trim()) {
      setMsg("Ad ve telefon girin.");
      return;
    }
    setSubmitting(p.id);
    setMsg(null);
    try {
      await createShopOrder({
        product_id: p.id,
        quantity: q,
        buyer_name: buyer.name.trim(),
        buyer_phone: buyer.phone.trim(),
      });
      setMsg(`Sipariş alındı: ${p.name} × ${q}`);
      const list = await listShopProducts();
      setProducts(list);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Sipariş oluşturulamadı");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <PanelPageHeader
        eyebrow="Mağaza"
        title="Kulüp ürünleri"
        description="Sipariş talebiniz kayda alınır; stok güncellenir. Ödeme ve teslimat için kulüp ile iletişime geçin."
        icon={ShoppingBag}
      />

      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-xs font-semibold text-slate-700">Alıcı bilgisi (tüm siparişler için)</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-slate-500">Ad soyad</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
              value={buyer.name}
              onChange={(e) => setBuyer((b) => ({ ...b, name: e.target.value }))}
              placeholder="Örn. Ayşe Yılmaz"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-500">Telefon</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
              value={buyer.phone}
              onChange={(e) => setBuyer((b) => ({ ...b, phone: e.target.value }))}
              placeholder="05xx..."
            />
          </label>
        </div>
      </div>

      {err && <p className="mb-4 text-sm text-red-700">{err}</p>}
      {msg && <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{msg}</p>}

      {products === null ? (
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          Yükleniyor…
        </div>
      ) : products.length === 0 ? (
        <p className="text-slate-600">Şu an listelenen ürün yok.</p>
      ) : (
        <ul className="space-y-4">
          {products.map((p) => (
            <li key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{p.name}</h2>
                  {p.description && <p className="mt-1 text-sm text-slate-600">{p.description}</p>}
                  <p className="mt-2 font-mono text-sm font-semibold text-emerald-800">
                    {p.price_try.toFixed(2)} ₺ · Stok: {p.stock}
                  </p>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                  <label className="text-sm text-slate-600">
                    Adet
                    <input
                      type="number"
                      min={1}
                      max={p.stock}
                      className="ml-2 w-20 rounded-lg border border-slate-200 px-2 py-1.5"
                      value={qty[p.id] ?? 1}
                      onChange={(e) =>
                        setQty((prev) => ({ ...prev, [p.id]: Math.max(1, Number(e.target.value) || 1) }))
                      }
                    />
                  </label>
                  <button
                    type="button"
                    disabled={submitting === p.id || p.stock < 1}
                    onClick={() => orderProduct(p)}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {submitting === p.id ? "…" : "Sipariş ver"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
