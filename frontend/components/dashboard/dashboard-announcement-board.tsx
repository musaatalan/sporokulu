"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Megaphone, Send } from "lucide-react";

import { createAnnouncement, listAnnouncements } from "@/lib/api";
import type { AnnouncementOut } from "@/lib/types/announcement";
import { PanelCard } from "@/components/ui/panel-card";

function notifyAnnouncementsChanged() {
  window.dispatchEvent(new CustomEvent("sporokulu:announcements-changed"));
}

export function DashboardAnnouncementBoard() {
  const [items, setItems] = useState<AnnouncementOut[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [branch, setBranch] = useState("");
  const [sending, setSending] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    listAnnouncements({ limit: 4 })
      .then((data) => {
        setItems(data);
        setErr(null);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Duyurular yüklenemedi"));
  }, []);

  useEffect(() => {
    load();
    const h = () => load();
    window.addEventListener("sporokulu:announcements-changed", h);
    return () => window.removeEventListener("sporokulu:announcements-changed", h);
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormMsg(null);
    if (!title.trim() || !content.trim()) {
      setFormMsg("Başlık ve içerik gerekli.");
      return;
    }
    setSending(true);
    try {
      await createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        target_branch: branch.trim() || null,
      });
      setTitle("");
      setContent("");
      setBranch("");
      setFormOpen(false);
      setFormMsg(null);
      notifyAnnouncementsChanged();
    } catch (er) {
      setFormMsg(er instanceof Error ? er.message : "Gönderilemedi");
    } finally {
      setSending(false);
    }
  }

  const toggleBtn = (
    <button
      type="button"
      onClick={() => setFormOpen((o) => !o)}
      className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
    >
      Yeni duyuru
      {formOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </button>
  );

  return (
    <div className="mb-8">
      <PanelCard
        title="Kulüp duyuruları"
        subtitle="Veli ve sporculara giden mesajlar"
        icon={Megaphone}
        accent="amber"
        headerAction={toggleBtn}
      >
        {formOpen && (
          <form onSubmit={onSubmit} className="mb-5 space-y-3 rounded-xl border border-amber-100 bg-amber-50/40 p-4">
            <label className="block text-xs font-medium text-slate-700">
              Başlık
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                maxLength={200}
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              İçerik
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 min-h-[88px] w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                maxLength={5000}
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Branş (boş = tüm kulüp)
              <input
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="Örn. Futbol"
                maxLength={120}
              />
            </label>
            {formMsg && <p className="text-xs text-red-600">{formMsg}</p>}
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
            >
              <Send className="h-4 w-4" aria-hidden />
              {sending ? "Gönderiliyor…" : "Yayınla"}
            </button>
          </form>
        )}

        {err && <p className="text-sm text-red-700">{err}</p>}

        {!err && items.length === 0 && !formOpen && (
          <p className="py-4 text-sm text-slate-600">Henüz duyuru yok. Yeni duyuru ile başlayabilirsiniz.</p>
        )}

        {items.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-1 pt-1 [-webkit-overflow-scrolling:touch]">
            {items.map((a) => (
              <article
                key={a.id}
                className="min-w-[min(100%,260px)] max-w-[300px] shrink-0 snap-start rounded-xl border border-amber-100/90 bg-gradient-to-b from-white to-amber-50/30 p-4 shadow-sm"
              >
                <p className="line-clamp-2 font-semibold text-slate-900">{a.title}</p>
                <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-600">{a.content}</p>
                <p className="mt-3 text-[10px] font-medium text-slate-400">
                  {a.target_branch || "Tüm kulüp"} · {new Date(a.created_at).toLocaleDateString("tr-TR")}
                </p>
              </article>
            ))}
          </div>
        )}
      </PanelCard>
    </div>
  );
}
