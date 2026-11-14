import type { components } from "../api-schema";

export type AttemptStatus = components["schemas"]["AttemptStatus"];
export type MessageSender = components["schemas"]["MessageSender"];
export type EvaluationMethod = components["schemas"]["EvaluationMethod"];

export type LongCaseAttemptRead = components["schemas"]["LongCaseAttemptRead"];
export type LongCaseAttemptCreate = components["schemas"]["LongCaseAttemptCreate"];

export type LongCaseAttemptMessageRead = components["schemas"]["LongCaseAttemptMessageRead"];
export type LongCaseAttemptMessageCreate = components["schemas"]["LongCaseAttemptMessageCreate"];

export type LongCaseAttemptExaminationSelectionRead = components["schemas"]["LongCaseAttemptExaminationSelectionRead"];
export type LongCaseAttemptExaminationSelectionCreate = components["schemas"]["LongCaseAttemptExaminationSelectionCreate"];

export type LongCaseAttemptHistoryResultRead = components["schemas"]["LongCaseAttemptHistoryResultRead"];

export type LongCaseAttemptChatRequest = components["schemas"]["LongCaseAttemptChatRequest"];
export type LongCaseAttemptChatResponse = components["schemas"]["LongCaseAttemptChatResponse"];

// Query params
export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface LongCaseAttemptDetail extends LongCaseAttemptRead {
  messages: LongCaseAttemptMessageRead[];
}