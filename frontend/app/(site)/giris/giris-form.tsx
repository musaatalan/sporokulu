"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Heart, Loader2, Lock, Mail, Sparkles } from "lucide-react";

import { loginRequest } from "@/lib/api";
import { setAccessTokenCookie } from "@/lib/auth-cookie";

export function GirisForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await loginRequest(email, password);
      setAccessTokenCookie(res.access_token);
      const next = searchParams.get("redirect")?.trim();
      const role = res.user.role;
      if (role === "VELI") {
        router.push(next && next.startsWith("/panel") ? next : "/panel/veli");
      } else if (role === "ADMIN" || role === "ANTRENOR") {
        if (next && !next.startsWith("/panel")) {
          router.push(next);
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Giriş başarısız");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-[420px] flex-col justify-center px-4 py-10 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl shadow-emerald-950/20 backdrop-blur-sm">
        <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 px-8 pb-12 pt-14 text-center text-white">
          <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.06%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40" aria-hidden />
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-white/15 shadow-lg ring-2 ring-white/25 backdrop-blur-md">
            <Sparkles className="h-12 w-12 text-amber-200 drop-shadow-md" aria-hidden />
          </div>
          <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.25em] text-emerald-100/95">Spor Okulu</p>
          <h1 className="relative mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Geleceğin Yıldızları</h1>
          <p className="relative mx-auto mt-3 max-w-xs text-sm leading-relaxed text-emerald-50/95">
            Veli ve kulüp personeli için güvenli giriş
          </p>
          <div className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-emerald-50 ring-1 ring-white/20">
            <Heart className="h-3.5 w-3.5 text-amber-200" aria-hidden />
            Resmi kulüp hesabınızla devam edin
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 px-8 py-9">
          {err && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {err}
            </p>
          )}

          <label className="block text-sm">
            <span className="flex items-center gap-2 font-semibold text-slate-700">
              <Mail className="h-4 w-4 text-emerald-600" aria-hidden />
              E-posta
            </span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm outline-none ring-emerald-500/25 transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4"
              placeholder="E-posta adresiniz"
            />
          </label>

          <label className="block text-sm">
            <span className="flex items-center gap-2 font-semibold text-slate-700">
              <Lock className="h-4 w-4 text-emerald-600" aria-hidden />
              Şifre
            </span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm outline-none ring-emerald-500/25 transition focus:border-emerald-500 focus:ring-4"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="flex w-full min-h-[52px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
            Giriş yap
          </button>

          <p className="text-center text-xs leading-relaxed text-slate-500">
            Şifrenizi unuttuysanız veya hesabınız yoksa kulüp yönetimiyle iletişime geçin.
          </p>
        </form>
      </div>

      <p className="mt-8 text-center text-xs text-slate-500">
        <Link href="/shop" className="font-medium text-emerald-700 hover:text-emerald-800">
          Mağaza ve ilanlar
        </Link>
        <span className="mx-2 text-slate-300">·</span>
        <Link href="/second-hand" className="font-medium text-emerald-700 hover:text-emerald-800">
          İkinci el
        </Link>
      </p>
    </div>
  );
}
