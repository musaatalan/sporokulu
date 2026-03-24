export default function GirisLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-7rem)] bg-gradient-to-b from-emerald-950/5 via-emerald-50/30 to-teal-50/40">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-200/25 via-transparent to-transparent"
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}
