/** QR metninden sporcu token (UUID) cikarir — tam URL veya duz UUID. */

const IN_URL =
  /(?:sporcu-qr|veli)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
const PLAIN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function extractQrToken(decodedText: string): string | null {
  const s = decodedText.trim();
  if (!s) return null;
  const m = s.match(IN_URL);
  if (m) return m[1].toLowerCase();
  if (PLAIN.test(s)) return s.toLowerCase();
  return null;
}
