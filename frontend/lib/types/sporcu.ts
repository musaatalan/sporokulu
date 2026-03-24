/** GET /sporcular ve GET /sporcular/{id} yanıtı (SporcuOut). */

export type DominantFoot = "sag" | "sol" | "iki_ayak" | null;

export interface SporcuOut {
  id: number;
  full_name: string;
  birth_date: string | null;
  gender: string | null;
  sport_branch: string;
  height_cm: number | null;
  weight_kg: number | null;
  blood_group: string | null;
  dominant_foot: DominantFoot;
  position: string | null;
  phone: string | null;
  email: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  registration_date: string;
  is_active: boolean;
  notes: string | null;
  math_grade: number | null;
  turkish_grade: number | null;
  academic_notes: string | null;
  created_at: string;
  updated_at: string;
  qr_token: string | null;
  qr_target_url: string | null;
  profile_video_url: string | null;
  nutrition_plan_text: string | null;
}
