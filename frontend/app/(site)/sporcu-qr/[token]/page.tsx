import { redirect } from "next/navigation";

type Props = { params: { token: string } };

/** Eski QR baglantilari yeni veli sayfasina yonlendirilir. */
export default function SporcuQrRedirectPage({ params }: Props) {
  redirect(`/veli/${params.token}`);
}
