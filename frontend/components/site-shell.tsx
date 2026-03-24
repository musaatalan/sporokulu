import Link from "next/link";
import { LayoutDashboard, Sparkles } from "lucide-react";

import { AuthNav } from "@/components/auth-nav";

const navClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-900";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-emerald-50/50">
      <header className="sticky top-0 z-20 border-b border-emerald-100/80 bg-white/90 shadow-sm shadow-emerald-900/[0.03] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/25">
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            <div className="leading-tight">
              <span className="block text-sm font-bold tracking-tight text-slate-900 sm:text-base">Geleceğin Yıldızları</span>
              <span className="hidden text-xs font-medium text-emerald-700/90 sm:block">Spor Okulu</span>
            </div>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
            <Link href="/dashboard" className={navClass}>
              <span className="hidden items-center gap-1.5 sm:inline-flex">
                <LayoutDashboard className="h-4 w-4 text-emerald-600" aria-hidden />
                Panel
              </span>
              <span className="sm:hidden">Panel</span>
            </Link>
            <Link href="/scanner" className={navClass}>
              QR yoklama
            </Link>
            <Link href="/shop" className={navClass}>
              Mağaza
            </Link>
            <Link href="/second-hand" className={navClass}>
              İkinci el
            </Link>
            <Link
              href="/kayit"
              className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700"
            >
              Yeni sporcu
            </Link>
            <AuthNav />
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-emerald-100/80 bg-white/80 py-5 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-600">Geleceğin Yıldızları Spor Okulu</p>
        <p className="mt-1 text-slate-400">Kulüp yönetimi ve veli bilgilendirme</p>
      </footer>
    </div>
  );
}
