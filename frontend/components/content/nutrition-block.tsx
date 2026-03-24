/** Beslenme metni: | ile ayrilmis satirlari tablo olarak gosterir; degilse pre. */

function parseTable(text: string): string[][] | null {
  const lines = text
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return null;
  const rows = lines.map((l) => l.split("|").map((c) => c.trim()));
  const cols = rows[0].length;
  if (cols < 2) return null;
  if (!rows.every((r) => r.length === cols)) return null;
  return rows;
}

export function NutritionBlock({ text }: { text: string }) {
  const table = parseTable(text);
  if (!table) {
    return (
      <pre className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
        {text}
      </pre>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[280px] border-collapse text-left text-sm">
        <tbody>
          {table.map((row, i) => (
            <tr key={i} className={i === 0 ? "border-b border-slate-200 bg-emerald-50/60 font-semibold text-slate-900" : "border-b border-slate-100"}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2.5 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
