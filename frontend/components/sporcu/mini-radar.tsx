"use client";

const N = 5;

type Props = {
  values: number[];
  size?: number;
  className?: string;
};

/** 0–100 değer dizisi (5 eksen). */
export function MiniRadar({ values, size = 88, className = "" }: Props) {
  const v = values.slice(0, N);
  while (v.length < N) v.push(50);
  const cx = size / 2;
  const cy = size / 2;
  const rMax = size * 0.38;
  const pts: string[] = [];
  for (let i = 0; i < N; i++) {
    const angle = (-Math.PI / 2 + (i * 2 * Math.PI) / N) % (2 * Math.PI);
    const t = Math.min(100, Math.max(0, v[i] ?? 50)) / 100;
    const r = rMax * t;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  const poly = pts.join(" ");

  const gridRings = [0.33, 0.66, 1].map((t) => {
    const ring: string[] = [];
    for (let i = 0; i < N; i++) {
      const angle = (-Math.PI / 2 + (i * 2 * Math.PI) / N) % (2 * Math.PI);
      const r = rMax * t;
      ring.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return ring.join(" ");
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label="Performans özeti radar grafiği"
    >
      <title>Performans özeti</title>
      {gridRings.map((points, idx) => (
        <polygon
          key={idx}
          points={points}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.12 + idx * 0.06}
          strokeWidth={1}
          className="text-slate-400"
        />
      ))}
      <polygon points={poly} fill="currentColor" fillOpacity={0.22} stroke="currentColor" strokeWidth={1.5} className="text-emerald-600" />
    </svg>
  );
}
