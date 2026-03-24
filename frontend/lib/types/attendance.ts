import type { SporcuOut } from "@/lib/types/sporcu";

export type AttendanceStatus = "geldi" | "gelmedi" | "gec";

export interface AttendanceOut {
  id: number;
  sporcu_id: number;
  recorded_at: string;
  status: AttendanceStatus;
}

export interface AttendanceScanResponse {
  sporcu: SporcuOut;
  attendance: AttendanceOut;
  parent_notification_simulated: boolean;
}

export interface TodayAttendanceEntry {
  sporcu_id: number;
  full_name: string;
  sport_branch: string;
  recorded_at: string;
  status: AttendanceStatus;
}

export interface TodayAttendanceResponse {
  date_local: string;
  distinct_arrived_today: number;
  records: TodayAttendanceEntry[];
}

export type ManualAttendanceStatus = "geldi" | "gelmedi" | "gec";

export interface ManualAttendanceResponse {
  sporcu: SporcuOut;
  attendance: AttendanceOut;
}

export interface MonthlyAttendanceReport {
  sporcu_id: number;
  year: number;
  month: number;
  training_days: number;
  present_days: number;
  missed_days: number;
  records_present: number;
  records_absent: number;
  participation_rate_pct: number | null;
  absent_rate_pct: number | null;
}
