export interface StudySession {
  id: string;
  user_id: string;
  subject_id: string;
  task_id: string | null;
  duration_minutes: number;
  completed_at: string;
}
