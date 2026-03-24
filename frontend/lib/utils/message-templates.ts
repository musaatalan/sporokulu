/**
 * VeliBot / WhatsApp icin ornek metin sablonlari (kopyala-yapistir veya API ile doldur).
 */

export type TemplateVars = Record<string, string | number>;

function fill(template: string, vars: TemplateVars): string {
  let s = template;
  for (const [k, v] of Object.entries(vars)) {
    s = s.replaceAll(`{{${k}}}`, String(v));
  }
  return s;
}

/** Yoklama (QR veya manuel) kaydedildiginde veliye. */
export function templateAttendanceRecorded(vars: { childName: string; time?: string; facility?: string }): string {
  return fill(
    "Merhaba, {{childName}} {{time}} saatinde tesise giriş olarak işlendi. İyi antrenmanlar! — Geleceğin Yıldızları{{facility}}",
    {
      childName: vars.childName,
      time: vars.time ?? "bugün",
      facility: vars.facility ? ` (${vars.facility})` : "",
    },
  );
}

/** Gelisim / performans raporu paylasiminda. */
export function templateProgressReportReady(vars: {
  childName: string;
  monthLabel?: string;
  summaryLine?: string;
}): string {
  return fill(
    "Merhaba, {{childName}} için {{monthLabel}} gelişim özetiniz hazır. {{summaryLine}} Detaylar kulüp panelinde. — Geleceğin Yıldızları",
    {
      childName: vars.childName,
      monthLabel: vars.monthLabel ?? "bu dönem",
      summaryLine: vars.summaryLine ?? "",
    },
  );
}

/** Akademik not guncellemesi (VeliBot on-hazirlik). */
export function templateAcademicUpdate(vars: { childName: string; noteSnippet: string }): string {
  return fill(
    "Merhaba, {{childName}} için akademik not/yorum güncellendi: {{noteSnippet}} — Geleceğin Yıldızları",
    {
      childName: vars.childName,
      noteSnippet: vars.noteSnippet,
    },
  );
}

/** Duyuru yayinlandiginda (brans veya genel). */
export function templateClubAnnouncement(vars: { title: string; excerpt: string }): string {
  return fill("Kulüp duyurusu: {{title}}\n{{excerpt}}", {
    title: vars.title,
    excerpt: vars.excerpt,
  });
}
