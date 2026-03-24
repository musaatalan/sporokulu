import { Suspense } from "react";

import { GirisForm } from "./giris-form";

export default function GirisPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Yükleniyor…</div>
      }
    >
      <GirisForm />
    </Suspense>
  );
}
