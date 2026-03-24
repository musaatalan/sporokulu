"use client";

import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";

import { getVeliProfileMe } from "@/lib/api";
import type { VeliProfileResponse } from "@/lib/types/veli-profile";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { VeliProfileBody } from "@/components/veli/veli-profile-body";

export default function VeliPanelPage() {
  const [data, setData] = useState<VeliProfileResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const p = await getVeliProfileMe();
        if (!c) setData(p);
      } catch (e) {
        if (!c) setErr(e instanceof Error ? e.message : "Yüklenemedi");
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  if (err) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 shadow-sm">
          <p className="font-semibold">Profil açılamadı</p>
          <p className="mt-1 opacity-90">{err}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-600">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" aria-hidden />
        <p className="text-sm font-medium">Çocuğunuzun bilgileri yükleniyor…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <PanelPageHeader
        eyebrow="Veli paneli"
        title={data.sporcu.full_name}
        description={`${data.sporcu.sport_branch} · Gelişim özeti, yoklama ve kulüp duyuruları aşağıda.`}
        icon={Heart}
      />
      <VeliProfileBody data={data} homeworkMode={{ mode: "jwt" }} hideHeroName />
    </div>
  );
}
