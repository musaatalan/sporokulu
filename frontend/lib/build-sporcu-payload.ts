/** FormData → SporcuCreate uyumlu JSON (boş alanlar gönderilmez). */

function parseNum(raw: string): number | undefined {
  const n = parseFloat(raw.replace(",", ".").trim());
  return Number.isFinite(n) ? n : undefined;
}

export function buildSporcuCreateFromFormData(fd: FormData): Record<string, unknown> {
  const full_name = String(fd.get("full_name") ?? "").trim();
  const sport_branch = String(fd.get("sport_branch") ?? "").trim();
  if (!full_name || !sport_branch) {
    throw new Error("Ad soyad ve branş zorunludur.");
  }

  const out: Record<string, unknown> = {
    full_name,
    sport_branch,
    is_active: fd.get("is_active") === "true",
  };

  const str = (k: string) => {
    const v = String(fd.get(k) ?? "").trim();
    if (v) out[k] = v;
  };

  str("birth_date");
  str("gender");
  str("phone");
  str("email");
  str("parent_name");
  str("parent_phone");
  str("notes");

  const bg = String(fd.get("blood_group") ?? "").trim();
  if (bg) out.blood_group = bg;

  const foot = String(fd.get("dominant_foot") ?? "").trim();
  if (foot) out.dominant_foot = foot;

  const pos = String(fd.get("position") ?? "").trim();
  if (pos) out.position = pos;

  const h = parseNum(String(fd.get("height_cm") ?? ""));
  if (h !== undefined) out.height_cm = h;

  const w = parseNum(String(fd.get("weight_kg") ?? ""));
  if (w !== undefined) out.weight_kg = w;

  const mg = parseNum(String(fd.get("math_grade") ?? ""));
  if (mg !== undefined) out.math_grade = mg;

  const tg = parseNum(String(fd.get("turkish_grade") ?? ""));
  if (tg !== undefined) out.turkish_grade = tg;

  const an = String(fd.get("academic_notes") ?? "").trim();
  if (an) out.academic_notes = an;

  return out;
}
