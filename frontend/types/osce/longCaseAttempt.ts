// TODO: replace with the values of the backend enums.
export type AttemptStatus = string;
export type MessageSender = string;
export type EvaluationMethod = string;

// Entities (field names mirror the backend's snake_case responses)
export interface LongCaseAttempt {
  id: string;
  student_id: string;
  long_case_id: string;
  status: AttemptStatus;
  started_at: string;
  history_completed_at: string | null;
  examination_completed_at: string | null;
  summary_completed_at: string | null;
  evaluated_at: string | null;
  total_score: number | null;
  passed: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface LongCaseAttemptMessage {
  id: string;
  attempt_id: string;
  sender: MessageSender;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface LongCaseAttemptExaminationSelection {
  id: string;
  attempt_id: string;
  query_text: string;
  examination_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LongCaseAttemptHistoryResult {
  id: string;
  attempt_id: string;
  history_item_id: string;
  is_met: boolean;
  score_awarded: number;
  evaluation_method_used: EvaluationMethod;
  judge_reasoning: string | null;
  evaluated_at: string;
  created_at: string;
  updated_at: string;
}

// Payloads
export interface LongCaseAttemptCreate {
  long_case_id: string;
}

/**
 * Student-writable progression fields only. Scoring fields
 * (`total_score`, `passed`, `evaluated_at`) are intentionally excluded.
 */
export type LongCaseAttemptProgressionUpdate = Partial<
  Pick<
    LongCaseAttempt,
    "status" | "history_completed_at" | "examination_completed_at" | "summary_completed_at"
  >
>;

export interface LongCaseAttemptMessageCreate {
  sender: MessageSender;
  content: string;
}

export interface LongCaseAttemptExaminationSelectionCreate {
  query_text: string;
  examination_id?: string | null;
}

// Query params
export interface PaginationParams {
  skip?: number;
  limit?: number;
}
