import type { AnnouncementOut } from "@/lib/types/announcement";
import type { MonthlyAttendanceReport } from "@/lib/types/attendance";
import type { PerformanceOut } from "@/lib/types/performance";

export interface VeliSporcuPublic {
  full_name: string;
  sport_branch: string;
  position: string | null;
  dominant_foot: string | null;
  math_grade: number | null;
  turkish_grade: number | null;
  academic_notes: string | null;
  qr_png_url: string;
  profile_video_url: string | null;
  nutrition_plan_text: string | null;
}

export interface HomeworkItem {
  id: number;
  sporcu_id: number;
  title: string;
  description: string | null;
  assigned_for_date: string;
  parent_confirmed_at: string | null;
  created_at: string;
}

export interface VeliProfileResponse {
  sporcu: VeliSporcuPublic;
  performance: PerformanceOut | null;
  attendance_month: MonthlyAttendanceReport;
  announcements: AnnouncementOut[];
  is_athlete_of_week: boolean;
  athlete_of_week_note: string | null;
  homework: HomeworkItem[];
}
