import { apiRequest, apiRequestOrNull, type CallOptions, type GetToken } from "@/lib/api/client";
import type {
  Examination,
  HistoryItem,
  Investigation,
  LongCase,
  LongCaseDetail,
  LongCaseListParams,
  LongCaseWritePayload,
  PatientProfile,
} from "@/types/osce/longCase";

const BASE_PATH = "/long-cases";

// Public endpoints

export function getLongCases(params: LongCaseListParams = {}, { signal }: CallOptions = {}): Promise<LongCase[]> {
  return apiRequest<LongCase[]>(BASE_PATH, { query: { ...params }, signal });
}

export function getLongCaseById(longCaseId: string, { signal }: CallOptions = {}): Promise<LongCase | null> {
  return apiRequestOrNull<LongCase>(`${BASE_PATH}/${longCaseId}`, { signal });
}

// Authenticated endpoints

export function getLongCaseDetails(
  getToken: GetToken,
  longCaseId: string,
  { signal }: CallOptions = {},
): Promise<LongCaseDetail | null> {
  return apiRequestOrNull<LongCaseDetail>(`${BASE_PATH}/${longCaseId}/details`, { getToken, signal });
}

export function getPatientProfile(
  getToken: GetToken,
  longCaseId: string,
  { signal }: CallOptions = {},
): Promise<PatientProfile | null> {
  return apiRequestOrNull<PatientProfile>(`${BASE_PATH}/${longCaseId}/patient-profile`, { getToken, signal });
}

// History items

export function getHistoryItems(
  getToken: GetToken,
  longCaseId: string,
  { signal }: CallOptions = {},
): Promise<HistoryItem[]> {
  return apiRequest<HistoryItem[]>(`${BASE_PATH}/${longCaseId}/history-items`, { getToken, signal });
}

export function getHistoryItemById(
  getToken: GetToken,
  longCaseId: string,
  itemId: string,
  { signal }: CallOptions = {},
): Promise<HistoryItem | null> {
  return apiRequestOrNull<HistoryItem>(`${BASE_PATH}/${longCaseId}/history-items/${itemId}`, { getToken, signal });
}

// Examinations

export function getExaminations(
  getToken: GetToken,
  longCaseId: string,
  { signal }: CallOptions = {},
): Promise<Examination[]> {
  return apiRequest<Examination[]>(`${BASE_PATH}/${longCaseId}/examinations`, { getToken, signal });
}

export function getExaminationById(
  getToken: GetToken,
  longCaseId: string,
  itemId: string,
  { signal }: CallOptions = {},
): Promise<Examination | null> {
  return apiRequestOrNull<Examination>(`${BASE_PATH}/${longCaseId}/examinations/${itemId}`, { getToken, signal });
}

// Investigations

export function getInvestigations(
  getToken: GetToken,
  longCaseId: string,
  { signal }: CallOptions = {},
): Promise<Investigation[]> {
  return apiRequest<Investigation[]>(`${BASE_PATH}/${longCaseId}/investigations`, { getToken, signal });
}

export function getInvestigationById(
  getToken: GetToken,
  longCaseId: string,
  itemId: string,
  { signal }: CallOptions = {},
): Promise<Investigation | null> {
  return apiRequestOrNull<Investigation>(`${BASE_PATH}/${longCaseId}/investigations/${itemId}`, {
    getToken,
    signal,
  });
}

// Admin endpoints

export function createLongCase(
  getToken: GetToken,
  longCase: Partial<LongCase>,
  { signal }: CallOptions = {},
): Promise<LongCase> {
  return apiRequest<LongCase>(BASE_PATH, { method: "POST", body: longCase, getToken, signal });
}

export function updateLongCase(
  getToken: GetToken,
  longCaseId: string,
  longCase: Partial<LongCase>,
  { signal }: CallOptions = {},
): Promise<LongCase> {
  return apiRequest<LongCase>(`${BASE_PATH}/${longCaseId}`, { method: "PATCH", body: longCase, getToken, signal });
}

export function deleteLongCase(
  getToken: GetToken,
  longCaseId: string,
  { signal }: CallOptions = {},
): Promise<void> {
  return apiRequest<void>(`${BASE_PATH}/${longCaseId}`, { method: "DELETE", getToken, signal });
}

/** Atomically creates a long case together with its full details. */
export function createLongCaseWithDetails(
  getToken: GetToken,
  payload: LongCaseWritePayload,
  { signal }: CallOptions = {},
): Promise<LongCaseDetail> {
  return apiRequest<LongCaseDetail>(`${BASE_PATH}/full`, { method: "POST", body: payload, getToken, signal });
}

/**
 * Atomically updates a long case and syncs its children:
 * children with an `id` are updated, without an `id` created, and omitted ones deleted.
 */
export function updateLongCaseWithDetails(
  getToken: GetToken,
  longCaseId: string,
  payload: LongCaseWritePayload,
  { signal }: CallOptions = {},
): Promise<LongCaseDetail> {
  return apiRequest<LongCaseDetail>(`${BASE_PATH}/${longCaseId}/details`, {
    method: "PUT",
    body: payload,
    getToken,
    signal,
  });
}
