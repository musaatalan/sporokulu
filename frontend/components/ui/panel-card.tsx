import type { LucideIcon } from "lucide-react";

type Accent = "emerald" | "amber" | "slate";

const accentRing: Record<Accent, string> = {
  emerald: "border-emerald-200/70 shadow-emerald-900/[0.04]",
  amber: "border-amber-200/70 shadow-amber-900/[0.04]",
  slate: "border-slate-200/90 shadow-slate-900/[0.03]",
};

const iconBg: Record<Accent, string> = {
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-800",
  slate: "bg-slate-100 text-slate-700",
};

export function PanelCard({
  title,
  subtitle,
  icon: Icon,
  children,
  className = "",
  accent = "emerald",
  headerAction,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  accent?: Accent;
  headerAction?: React.ReactNode;
}) {
  return (
    <section
      className={`flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm sm:p-6 ${accentRing[accent]} ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg[accent]}`}>
              <Icon className="h-5 w-5" aria-hidden />
            </div>
          ) : null}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h2>
            {subtitle ? <p className="mt-1 text-xs leading-relaxed text-slate-500">{subtitle}</p> : null}
          </div>
        </div>
        {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}
