export type UserRole = "admin" | "manager";

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export type CallStatus = "uploaded" | "processing" | "transcribed" | "analyzed" | "failed";
export type ScriptCompliance = "compliant" | "partial" | "non_compliant";

export interface Call {
  id: number;
  manager_id: number;
  manager_name: string | null;
  original_filename: string;
  duration_seconds: number | null;
  status: CallStatus;
  transcript: string | null;
  transcript_confidence: number | null;
  analysis: Record<string, any> | null;
  script_compliance: ScriptCompliance | null;
  compliance_score: number | null;
  talk_ratio: number | null;
  emotions: Record<string, any> | null;
  keywords_found: string[] | null;
  objections_handled: any[] | null;
  source: string | null;
  created_at: string;
  processed_at: string | null;
}

export interface CallListResponse {
  items: Call[];
  total: number;
  page: number;
  page_size: number;
}

export interface ManagerStats {
  manager_id: number;
  manager_name: string;
  total_calls: number;
  processed_calls: number;
  avg_duration: number | null;
  avg_compliance: number | null;
  avg_talk_ratio: number | null;
  complaints_count: number;
  partial_count: number;
  non_compliant_count: number;
  last_call_at: string | null;
}

export interface DashboardStats {
  total_calls: number;
  processed_calls: number;
  pending_calls: number;
  failed_calls: number;
  avg_compliance_score: number | null;
  avg_talk_ratio: number | null;
  compliance_distribution: Record<string, number>;
  top_keywords: { word: string; count: number }[];
  manager_stats: ManagerStats[];
  recent_calls: {
    id: number;
    manager_name: string | null;
    status: string;
    compliance: string | null;
    compliance_score: number | null;
    duration: number | null;
    created_at: string;
  }[];
}

export interface ManagerDetail {
  manager: User;
  stats: ManagerStats;
  compliance_trend: { date: string; avg_score: number; calls_count: number }[];
  recent_calls: {
    id: number;
    filename: string;
    status: string;
    compliance: string | null;
    compliance_score: number | null;
    duration: number | null;
    created_at: string;
  }[];
}
