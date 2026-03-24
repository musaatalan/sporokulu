/** Bu ay katılım yüzdesi — sunucu bileşeni (conic-gradient pasta). */

type Props = {
  participationPct: number | null;
};

export function AttendanceParticipationDonut({ participationPct }: Props) {
  if (participationPct === null) {
    return (
      <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-xs leading-snug text-slate-500">
        Bu ay için hesaplanabilir yoklama verisi yok.
      </div>
    );
  }

  const p = Math.min(100, Math.max(0, participationPct));

  return (
    <div className="relative h-36 w-36 shrink-0">
      <div
        className="h-full w-full rounded-full shadow-inner"
        style={{
          background: `conic-gradient(rgb(5 150 105) ${p * 3.6}deg, rgb(226 232 240) 0)`,
        }}
        aria-hidden
      />
      <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-white text-center shadow-sm">
        <span className="text-lg font-bold tabular-nums text-slate-900">{Math.round(p)}%</span>
        <span className="text-[10px] font-medium text-slate-500">katılım</span>
      </div>
    </div>
  );
}
