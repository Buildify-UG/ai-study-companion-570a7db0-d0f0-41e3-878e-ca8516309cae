import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  name: string;
  email: string;
  semester?: string;
  academic_goal?: string;
  gpa?: number;
  study_streak: number;
  total_study_hours: number;
};

export type Subject = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  semester?: string;
  progress: number;
  grade?: string;
  created_at: string;
};

export type Lecture = {
  id: string;
  subject_id: string;
  title: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  pdf_url?: string;
  created_at: string;
};

export type Exam = {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  exam_type?: string;
  exam_date: string;
  priority: "low" | "medium" | "high";
  created_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  due_date?: string;
  priority: "low" | "medium" | "high";
  created_at: string;
};

export type StudySession = {
  id: string;
  user_id: string;
  subject_id?: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  breaks: number;
  completed: boolean;
  created_at: string;
};

export type Achievement = {
  id: string;
  user_id: string;
  badge_name: string;
  description?: string;
  earned_at: string;
};

export type NotificationSettings = {
  id: string;
  user_id: string;
  study_reminders: boolean;
  exam_alerts: boolean;
  task_notifications: boolean;
  streak_notifications: boolean;
};
