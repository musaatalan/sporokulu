/** YouTube paylasim URL -> embed URL (yoksa null). */

export function getYoutubeEmbedUrl(url: string | null | undefined): string | null {
  const u = url?.trim();
  if (!u) return null;
  const m = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  if (u.includes("youtube.com/embed/")) return u;
  return null;
}
