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

export interface CriteriaScores {
  greeting: number;
  speech: number;
  initiative: number;
  programming: number;
  qualification: number;
  pain: number;
  product: number;
  expertise: number;
  closing: number;
  push: number;
  next_step: number;
  framing: number;
}

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
  progress: number;
  source: string | null;
  created_at: string;
  processed_at: string | null;
  // New fields
  call_type: string | null;
  warmth: string | null;
  fg_score: number | null;
  criteria_scores: Record<string, number> | null;
  objection_count: number | null;
  objection_types: string[] | null;
  manager_tone: string | null;
  client_tone: string | null;
  strengths: string[] | null;
  growth_areas: string[] | null;
  exclude_from_rating: boolean;
  client_data: {
    request: string | null;
    income_source: string | null;
    age: string | null;
    city: string | null;
    purchase_readiness: string | null;
    main_objections: string[] | null;
    result_timeline: string | null;
  } | null;
  conversation: { speaker: 'manager' | 'client'; text: string; timestamp: number }[] | null;
}

export interface CallListResponse {
  items: Call[];
  total: number;
  page: number;
  page_size: number;
}

export interface CallTypeStats {
  call_type: string;
  count: number;
  avg_fg: number | null;
  total_duration: number;
}

export interface CriteriaAvg {
  greeting: number | null;
  speech: number | null;
  initiative: number | null;
  programming: number | null;
  qualification: number | null;
  pain: number | null;
  product: number | null;
  expertise: number | null;
  closing: number | null;
  push: number | null;
  next_step: number | null;
  framing: number | null;
}

export interface ManagerStats {
  manager_id: number;
  manager_name: string;
  total_calls: number;
  processed_calls: number;
  avg_duration: number | null;
  avg_compliance: number | null;
  avg_talk_ratio: number | null;
  avg_fg_score: number | null;
  criteria_avg: CriteriaAvg | null;
  complaints_count: number;
  partial_count: number;
  non_compliant_count: number;
  last_call_at: string | null;
  call_type_breakdown: CallTypeStats[];
}

export interface DashboardStats {
  total_calls: number;
  processed_calls: number;
  pending_calls: number;
  failed_calls: number;
  avg_compliance_score: number | null;
  avg_talk_ratio: number | null;
  avg_fg_score: number | null;
  compliance_distribution: Record<string, number>;
  call_type_distribution: CallTypeStats[];
  warmth_distribution: Record<string, number>;
  top_keywords: { word: string; count: number }[];
  manager_stats: ManagerStats[];
  recent_calls: {
    id: number;
    manager_name: string | null;
    status: string;
    compliance: string | null;
    compliance_score: number | null;
    fg_score: number | null;
    call_type: string | null;
    warmth: string | null;
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
    fg_score: number | null;
    call_type: string | null;
    warmth: string | null;
    duration: number | null;
    created_at: string;
  }[];
}

// ═══════════════════════════════════════════
// AI-Sales types
// ═══════════════════════════════════════════

export interface SalesScript {
  id: number;
  name: string;
  description: string | null;
  script_data: any;
  system_prompt: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalesContact {
  id: number;
  name: string | null;
  phone: string;
  company: string | null;
  extra_data: any;
  created_at: string;
}

export interface SalesCampaign {
  id: number;
  name: string;
  script_id: number;
  status: string;
  max_calls_per_day: number;
  call_interval_seconds: number;
  working_hours_start: string;
  working_hours_end: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  script: SalesScript | null;
  contact_count: number | null;
  call_count: number | null;
}

export interface SalesCall {
  id: number;
  campaign_id: number;
  contact_id: number;
  phone: string;
  duration_seconds: number | null;
  status: string;
  result: string | null;
  result_reason: string | null;
  script_stage: string | null;
  conversation: { speaker: string; text: string; timestamp?: number }[] | null;
  summary: string | null;
  quality_score: number | null;
  quality_details: any;
  client_data: any;
  simulation_config: any;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  contact: SalesContact | null;
}

export interface SalesStats {
  total_calls: number;
  by_result: Record<string, number>;
  avg_quality_score: number | null;
  total_campaigns: number;
  total_contacts: number;
}
