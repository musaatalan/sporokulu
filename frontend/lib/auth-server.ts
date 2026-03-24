import { cookies } from "next/headers";

/** Sunucu bilesenlerinde API cagrisi icin Authorization (middleware zaten token var). */
export function getServerAuthHeaders(): Record<string, string> {
  const token = cookies().get("sporokulu_access_token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
