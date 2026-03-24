import { getYoutubeEmbedUrl } from "@/lib/video";

type Props = {
  url: string | null | undefined;
  title?: string;
};

export function ProfileVideoFrame({ url, title = "Maç / antrenman videosu" }: Props) {
  const embed = getYoutubeEmbedUrl(url ?? null);
  if (!embed) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-black shadow-sm">
      <p className="bg-slate-900 px-3 py-2 text-xs font-medium text-white">{title}</p>
      <div className="relative aspect-video w-full">
        <iframe
          src={embed}
          className="absolute inset-0 h-full w-full"
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
