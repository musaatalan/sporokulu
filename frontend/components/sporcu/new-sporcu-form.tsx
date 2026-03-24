"use client";

import { useState } from "react";
import {
  Activity,
  BookOpen,
  Droplet,
  Footprints,
  Mail,
  MapPin,
  NotebookPen,
  Phone,
  Ruler,
  Scale,
  User,
  UserCircle,
  UserRound,
} from "lucide-react";

import { createSporcu } from "@/lib/api";
import { buildSporcuCreateFromFormData } from "@/lib/build-sporcu-payload";
import { inputClass, labelClass, sectionTitleClass } from "@/components/sporcu/form-styles";

const KAN_GRUPLARI = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const AYAK_SEC = [
  { value: "", label: "Seçiniz" },
  { value: "sag", label: "Sağ ayak" },
  { value: "sol", label: "Sol ayak" },
  { value: "iki_ayak", label: "İki ayak" },
] as const;

export function NewSporcuForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const body = buildSporcuCreateFromFormData(fd);
      await createSporcu(body);
      setStatus("ok");
      setMessage("Kayıt başarıyla oluşturuldu.");
      form.reset();
      const hidden = form.querySelector('input[name="is_active"]') as HTMLInputElement | null;
      if (hidden) hidden.value = "true";
    } catch (err) {
      setStatus("err");
      setMessage(err instanceof Error ? err.message : "Kayıt başarısız.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-10 pb-4 sm:pb-8">
      <input type="hidden" name="is_active" value="true" />

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <h2 className={sectionTitleClass}>
          <User className="h-4 w-4" aria-hidden />
          Kimlik
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            <span>
              Ad soyad <span className="text-red-500">*</span>
            </span>
            <input className={inputClass} name="full_name" required maxLength={255} placeholder="Örn. Ali Yılmaz" />
          </label>
          <label className={labelClass}>
            <span className="inline-flex items-center gap-1.5">
              <span>Doğum tarihi</span>
            </span>
            <input className={inputClass} name="birth_date" type="date" />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="h-4 w-4 text-slate-400" aria-hidden />
              Cinsiyet
            </span>
            <select className={inputClass} name="gender" defaultValue="">
              <option value="">Seçiniz</option>
              <option value="Kadin">Kadın</option>
              <option value="Erkek">Erkek</option>
              <option value="Belirtmek istemiyorum">Belirtmek istemiyorum</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <h2 className={sectionTitleClass}>
          <Activity className="h-4 w-4" aria-hidden />
          Branş ve saha
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={`${labelClass} sm:col-span-2`}>
            <span>
              Branş <span className="text-red-500">*</span>
            </span>
            <input
              className={inputClass}
              name="sport_branch"
              required
              maxLength={120}
              placeholder="Örn. Futbol, Basketbol, Yüzme"
            />
          </label>
          <label className={labelClass}>
            <span className="inline-flex items-center gap-1.5">
              <Footprints className="h-4 w-4 text-slate-400" aria-hidden />
              Baskın ayak
            </span>
            <select className={inputClass} name="dominant_foot" defaultValue="">
              {AYAK_SEC.map((o) => (
                <option key={o.value || "empty"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-slate-400" aria-hidden />
              Mevki
            </span>
            <input className={inputClass} name="position" maxLength={80} placeholder="Örn. kaleci, oyun kurucu" />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <h2 className={sectionTitleClass}>
          <Ruler className="h-4 w-4" aria-hidden />
          Fiziksel bilgiler
        </h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <label className={labelClass}>
            <span className="inline-flex items-center gap-1.5">
              <Ruler className="h-4 w-4 text-slate-400" aria-hidden />
              Boy (cm)
            </span>
            <input className={inputClass} name="height_cm" type="number" min={1} max={280} step={0.1} placeholder="175" />
          </label>
          <label className={labelClass}>
            <span className="inline-flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-slate-400" aria-hidden />
              Kilo (kg)
            </span>
            <input className={inputClass} name="weight_kg" type="number" min={1} max={400} step={0.1} placeholder="68" />
          </label>
          <label className={labelClass}>
            <span className="inline-flex items-center gap-1.5">
              <Droplet className="h-4 w-4 text-rose-400" aria-hidden />
              Kan grubu
            </span>
            <select className={inputClass} name="blood_group" defaultValue="">
              {KAN_GRUPLARI.map((g) => (
                <option key={g || "empty"} value={g}>
                  {g ? g : "Seçiniz"}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <h2 className={sectionTitleClass}>
          <Phone className="h-4 w-4" aria-hidden />
          İletişim ve veli
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-slate-400" aria-hidden />
              Sporcu telefon
            </span>
            <input className={inputClass} name="phone" maxLength={30} placeholder="05xx …" />
          </label>
          <label className={labelClass}>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-slate-400" aria-hidden />
              E-posta
            </span>
            <input className={inputClass} name="email" type="email" maxLength={255} placeholder="ornek@mail.com" />
          </label>
          <label className={labelClass}>
            <span className="inline-flex items-center gap-1.5">
              <UserCircle className="h-4 w-4 text-slate-400" aria-hidden />
              Veli / vasi adı
            </span>
            <input className={inputClass} name="parent_name" maxLength={255} />
          </label>
          <label className={labelClass}>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-slate-400" aria-hidden />
              Veli telefon
            </span>
            <input className={inputClass} name="parent_phone" maxLength={30} />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <h2 className={sectionTitleClass}>
          <BookOpen className="h-4 w-4" aria-hidden />
          Akademik (isteğe bağlı)
        </h2>
        <p className="mb-4 text-xs text-slate-500">Okul ders notları ve kısa akademik not; boş bırakılabilir.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            <span>Matematik (0–100)</span>
            <input className={inputClass} name="math_grade" type="number" min={0} max={100} step={0.5} placeholder="örn. 85" />
          </label>
          <label className={labelClass}>
            <span>Türkçe (0–100)</span>
            <input className={inputClass} name="turkish_grade" type="number" min={0} max={100} step={0.5} placeholder="örn. 78" />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            <span>Akademik not metni</span>
            <textarea
              className={`${inputClass} min-h-[80px] resize-y`}
              name="academic_notes"
              rows={3}
              placeholder="Öğretmen görüşü, hedefler…"
              maxLength={2000}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <h2 className={sectionTitleClass}>
          <NotebookPen className="h-4 w-4" aria-hidden />
          Notlar
        </h2>
        <label className={labelClass}>
          <span>Ek bilgi</span>
          <textarea className={`${inputClass} min-h-[100px] resize-y`} name="notes" rows={4} placeholder="Alerji, hedefler, özel durum…" />
        </label>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {message ? (
          <p
            className={`text-sm font-medium ${status === "ok" ? "text-emerald-700" : status === "err" ? "text-red-600" : "text-slate-600"}`}
            role="status"
          >
            {message}
          </p>
        ) : (
          <span className="text-sm text-slate-500">Zorunlu alanlar * ile işaretlidir.</span>
        )}
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-emerald-600 px-8 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {status === "loading" ? "Kaydediliyor…" : "Kaydı gönder"}
        </button>
      </div>
    </form>
  );
}
