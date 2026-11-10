import { ATTEMPT_STATUS, EVALUATION_METHOD, MESSAGE_SENDER } from "../api-enums.generated";

export type AttemptStatus = (typeof ATTEMPT_STATUS)[number]
export type MessageSender = (typeof MESSAGE_SENDER)[number]
export type EvaluationMethod = (typeof EVALUATION_METHOD)[number]

// Entities (field names mirror the backend's snake_case responses)
export interface LongCaseAttempt {
  id: string;
  user_id: string;
  long_case_id: string;
  status: AttemptStatus;
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
export interface LongCaseAttemptDetail extends LongCaseAttempt {
  messages: LongCaseAttemptMessage[];
}

export interface LongCaseAttemptMessageCreate {
  content: string;
}

export interface LongCaseAttemptExaminationSelectionCreate {
  query_text: string;
  examination_id?: string | null;
}

export interface LongCaseAttemptChatRequest {
  content: string;
}
 
/** Response of POST /long-case-attempts/{attempt_id}/messages/chat */
export interface LongCaseAttemptChatResponse {
  assistant_message: LongCaseAttemptMessage;
}

// Query params
export interface PaginationParams {
  skip?: number;
  limit?: number;
}
