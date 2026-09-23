import { apiRequest, apiRequestOrNull, type CallOptions, type GetToken } from "@/lib/api/client";
import type {
  LongCaseAttempt,
  LongCaseAttemptChatRequest,
  LongCaseAttemptChatResponse,
  LongCaseAttemptCreate,
  LongCaseAttemptExaminationSelection,
  LongCaseAttemptExaminationSelectionCreate,
  LongCaseAttemptHistoryResult,
  LongCaseAttemptMessage,
  LongCaseAttemptMessageCreate,
  LongCaseAttemptProgressionUpdate,
  PaginationParams,
} from "@/types/osce/longCaseAttempt";

/**
 * All endpoints require authentication and are scoped to the current student.
 * Deletes are admin-only on the backend and intentionally not exposed here.
 * History-result creation/updates are evaluation (scoring) operations and are
 * intentionally not exposed to the client; results are read-only here.
 */

const BASE_PATH = "/long-case-attempts";

// Attempts

/** Rejects with `ApiError` (status 409) if the student already has an attempt for this case. */
export function createAttempt(
  getToken: GetToken,
  payload: LongCaseAttemptCreate,
  { signal }: CallOptions = {},
): Promise<LongCaseAttempt> {
  return apiRequest<LongCaseAttempt>(BASE_PATH, { method: "POST", body: payload, getToken, signal });
}

export function getMyAttempts(
  getToken: GetToken,
  params: PaginationParams = {},
  { signal }: CallOptions = {},
): Promise<LongCaseAttempt[]> {
  return apiRequest<LongCaseAttempt[]>(BASE_PATH, { query: { ...params }, getToken, signal });
}

export function getAttemptById(
  getToken: GetToken,
  attemptId: string,
  { signal }: CallOptions = {},
): Promise<LongCaseAttempt | null> {
  return apiRequestOrNull<LongCaseAttempt>(`${BASE_PATH}/${attemptId}`, { getToken, signal });
}

export function updateAttemptProgress(
  getToken: GetToken,
  attemptId: string,
  payload: LongCaseAttemptProgressionUpdate,
  { signal }: CallOptions = {},
): Promise<LongCaseAttempt> {
  return apiRequest<LongCaseAttempt>(`${BASE_PATH}/${attemptId}`, {
    method: "PATCH",
    body: payload,
    getToken,
    signal,
  });
}

// Messages (append-only transcript)

export function createMessage(
  getToken: GetToken,
  attemptId: string,
  payload: LongCaseAttemptMessageCreate,
  { signal }: CallOptions = {},
): Promise<LongCaseAttemptMessage> {
  return apiRequest<LongCaseAttemptMessage>(`${BASE_PATH}/${attemptId}/messages`, {
    method: "POST",
    body: payload,
    getToken,
    signal,
  });
}

export function getMessages(
  getToken: GetToken,
  attemptId: string,
  { signal }: CallOptions = {},
): Promise<LongCaseAttemptMessage[]> {
  return apiRequest<LongCaseAttemptMessage[]>(`${BASE_PATH}/${attemptId}/messages`, { getToken, signal });
}

export function getMessageById(
  getToken: GetToken,
  attemptId: string,
  messageId: string,
  { signal }: CallOptions = {},
): Promise<LongCaseAttemptMessage | null> {
  return apiRequestOrNull<LongCaseAttemptMessage>(`${BASE_PATH}/${attemptId}/messages/${messageId}`, {
    getToken,
    signal,
  });
}

/**
 * Sends the student's message and returns both the saved user message and the
 * LLM-generated patient reply. This calls an LLM server-side and can take
 * several seconds — pass a `signal` with a generous timeout (or none) rather
 * than the default used for quick CRUD calls elsewhere in this file.
 *
 * The user's message is persisted before the LLM is called, so on a 502 (LLM
 * failure) it is not lost — the caller should surface a retry, which will
 * post as a new message rather than duplicate the one already saved.
 */
export function sendChatMessage(
  getToken: GetToken,
  attemptId: string,
  content: string,
  { signal }: CallOptions = {},
): Promise<LongCaseAttemptChatResponse> {
  const body: LongCaseAttemptChatRequest = { content };
  return apiRequest<LongCaseAttemptChatResponse>(`${BASE_PATH}/${attemptId}/messages/chat`, {
    method: "POST",
    body,
    getToken,
    signal,
  });
}

// Examination selections

export function createExaminationSelection(
  getToken: GetToken,
  attemptId: string,
  payload: LongCaseAttemptExaminationSelectionCreate,
  { signal }: CallOptions = {},
): Promise<LongCaseAttemptExaminationSelection> {
  return apiRequest<LongCaseAttemptExaminationSelection>(`${BASE_PATH}/${attemptId}/examination-selections`, {
    method: "POST",
    body: payload,
    getToken,
    signal,
  });
}

export function getExaminationSelections(
  getToken: GetToken,
  attemptId: string,
  { signal }: CallOptions = {},
): Promise<LongCaseAttemptExaminationSelection[]> {
  return apiRequest<LongCaseAttemptExaminationSelection[]>(`${BASE_PATH}/${attemptId}/examination-selections`, {
    getToken,
    signal,
  });
}

export function getExaminationSelectionById(
  getToken: GetToken,
  attemptId: string,
  selectionId: string,
  { signal }: CallOptions = {},
): Promise<LongCaseAttemptExaminationSelection | null> {
  return apiRequestOrNull<LongCaseAttemptExaminationSelection>(
    `${BASE_PATH}/${attemptId}/examination-selections/${selectionId}`,
    { getToken, signal },
  );
}

// History results (read-only)

export function getHistoryResults(
  getToken: GetToken,
  attemptId: string,
  { signal }: CallOptions = {},
): Promise<LongCaseAttemptHistoryResult[]> {
  return apiRequest<LongCaseAttemptHistoryResult[]>(`${BASE_PATH}/${attemptId}/history-results`, {
    getToken,
    signal,
  });
}

export function getHistoryResultById(
  getToken: GetToken,
  attemptId: string,
  resultId: string,
  { signal }: CallOptions = {},
): Promise<LongCaseAttemptHistoryResult | null> {
  return apiRequestOrNull<LongCaseAttemptHistoryResult>(`${BASE_PATH}/${attemptId}/history-results/${resultId}`, {
    getToken,
    signal,
  });
}
