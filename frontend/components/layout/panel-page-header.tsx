import type { LucideIcon } from "lucide-react";

export function PanelPageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <header className="relative mb-8 overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 px-6 py-8 text-white shadow-lg shadow-emerald-900/15 sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-teal-400/20 blur-2xl" aria-hidden />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        {Icon ? (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-2 ring-white/25">
            <Icon className="h-8 w-8 text-amber-200" aria-hidden />
          </div>
        ) : null}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/90">{eyebrow}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {description ? <p className="mt-2 max-w-2xl text-sm text-emerald-50/95">{description}</p> : null}
        </div>
      </div>
    </header>
  );
}
