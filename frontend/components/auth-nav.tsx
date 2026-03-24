"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogIn, LogOut, UserCircle } from "lucide-react";

import { clearAccessTokenCookie, getStoredAccessToken, parseJwtPayloadRole } from "@/lib/auth-cookie";

export function AuthNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const t = getStoredAccessToken();
    setRole(t ? parseJwtPayloadRole(t) : null);
  }, [pathname]);

  function logout() {
    clearAccessTokenCookie();
    setRole(null);
    router.push("/giris");
    router.refresh();
  }

  if (!role) {
    return (
      <Link
        href="/giris"
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <LogIn className="h-4 w-4" aria-hidden />
        Giriş
      </Link>
    );
  }

  if (role === "VELI") {
    return (
      <>
        <Link
          href="/panel/veli"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <UserCircle className="h-4 w-4" aria-hidden />
          Çocuğum
        </Link>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Çıkış
        </button>
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
    >
      <LogOut className="h-4 w-4" aria-hidden />
      Çıkış
    </button>
  );
}
