import { FileUser } from "lucide-react";

import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { NewSporcuForm } from "@/components/sporcu/new-sporcu-form";

export const metadata = {
  title: "Yeni sporcu | Geleceğin Yıldızları",
  description: "Sporcu kayıt formu",
};

export default function KayitPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <PanelPageHeader
        eyebrow="Yeni kayıt"
        title="Sporcu bilgi formu"
        description="Tüm zorunlu alanları doldurun; kayıt tamamlandığında sporcu listenizde görünür ve QR ile yoklamaya hazır olur."
        icon={FileUser}
      />
      <NewSporcuForm />
    </div>
  );
}
