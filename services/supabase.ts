import { createClient } from '@supabase/supabase-js';

// These will be replaced with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. App will use local JSON fallback.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Type definitions for database tables
export interface DbQuestion {
  id: number;
  text: string;
  domain: string;
  type: string;
  explanation: string;
  exhibit_url: string | null;
  case_study_id: number | null;
  code_snippet: string | null;
  created_at: string;
}

export interface DbQuestionOption {
  id: string;
  question_id: number;
  text: string;
  is_correct: boolean;
}

export interface DbCaseStudy {
  id: number;
  title: string;
  content_markdown: string;
}

export interface DbUserSession {
  id: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface DbQuestionAttempt {
  id: string;
  user_session_id: string;
  question_id: number;
  is_correct: boolean;
  time_spent_seconds: number;
  created_at: string;
}
