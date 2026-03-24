export interface AnnouncementOut {
  id: number;
  title: string;
  content: string;
  target_branch: string | null;
  created_at: string;
}
