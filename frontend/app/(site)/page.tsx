/** Kök adres middleware ile /giris veya panele yönlendirilir; bu içerik nadiren görünür. */
export default function HomePage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="h-10 w-10 animate-pulse rounded-full bg-emerald-200/80" aria-hidden />
      <p className="mt-4 text-sm font-medium text-slate-600">Yönlendiriliyorsunuz…</p>
    </div>
  );
}
