import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getVeliProfile } from "@/lib/api";
import { VeliProfileBody } from "@/components/veli/veli-profile-body";

type Props = { params: { qr_token: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const p = await getVeliProfile(params.qr_token);
    return {
      title: `${p.sporcu.full_name} | Veli`,
      description: "Gelişim özeti ve kulüp duyuruları",
    };
  } catch {
    return { title: "Veli bilgi sayfası" };
  }
}

export default async function VeliProfilePage({ params }: Props) {
  let data;
  try {
    data = await getVeliProfile(params.qr_token);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <VeliProfileBody data={data} homeworkMode={{ mode: "qr", qrToken: params.qr_token }} />
    </div>
  );
}
