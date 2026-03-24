import Link from "next/link";
import { Heart } from "lucide-react";

import "./veli-globals.css";

export default function VeliLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="veli-root min-h-screen bg-gradient-to-b from-emerald-50/90 via-white to-slate-50">
      <header className="sticky top-0 z-10 border-b border-emerald-100/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-center gap-2 px-4 py-3">
          <Heart className="h-6 w-6 shrink-0 text-emerald-600" aria-hidden />
          <span className="text-center text-sm font-semibold text-slate-900 sm:text-base">Geleceğin Yıldızları · Veli</span>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-6 sm:px-5 sm:py-8">{children}</main>
      <footer className="mx-auto max-w-lg px-4 pb-8 pb-safe pt-4 text-center text-[11px] text-slate-500">
        Bu sayfa yalnızca size özel bağlantı ile açılır. Sorunuz için kulüple iletişime geçin.{" "}
        <Link href="/" className="text-emerald-700 underline-offset-2 hover:underline">
          Ana site
        </Link>
      </footer>
    </div>
  );
}
