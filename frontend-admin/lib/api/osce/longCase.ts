import { apiRequest, apiRequestOrNull, type CallOptions, type GetToken } from "@/lib/api/client";
import type {
  ExaminationRead,
  HistoryItemRead,
  InvestigationRead,
  LongCaseRead,
  LongCaseDetail,
  LongCaseListParams,
  LongCaseWrite,
  PatientProfileRead,
} from "@/types/osce/longCase";

const BASE_PATH = "/long-cases";

// Public endpoints


export function getLongCases(params: LongCaseListParams = {}, { signal }: CallOptions = {}): Promise<LongCaseRead[]> {
  return apiRequest<LongCaseRead[]>(BASE_PATH, { query: { ...params }, signal });
}

export function getLongCaseById(longCaseId: string, { signal }: CallOptions = {}): Promise<LongCaseRead | null> {
  return apiRequestOrNull<LongCaseRead>(`${BASE_PATH}/${longCaseId}`, { signal });
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
): Promise<PatientProfileRead | null> {
  return apiRequestOrNull<PatientProfileRead>(`${BASE_PATH}/${longCaseId}/patient-profile`, { getToken, signal });
}

// History items

export function getHistoryItems(
  getToken: GetToken,
  longCaseId: string,
  { signal }: CallOptions = {},
): Promise<HistoryItemRead[]> {
  return apiRequest<HistoryItemRead[]>(`${BASE_PATH}/${longCaseId}/history-items`, { getToken, signal });
}

export function getHistoryItemById(
  getToken: GetToken,
  longCaseId: string,
  itemId: string,
  { signal }: CallOptions = {},
): Promise<HistoryItemRead | null> {
  return apiRequestOrNull<HistoryItemRead>(`${BASE_PATH}/${longCaseId}/history-items/${itemId}`, { getToken, signal });
}

// Examinations

export function getExaminations(
  getToken: GetToken,
  longCaseId: string,
  { signal }: CallOptions = {},
): Promise<ExaminationRead[]> {
  return apiRequest<ExaminationRead[]>(`${BASE_PATH}/${longCaseId}/examinations`, { getToken, signal });
}

export function getExaminationById(
  getToken: GetToken,
  longCaseId: string,
  itemId: string,
  { signal }: CallOptions = {},
): Promise<ExaminationRead | null> {
  return apiRequestOrNull<ExaminationRead>(`${BASE_PATH}/${longCaseId}/examinations/${itemId}`, { getToken, signal });
}

// Investigations

export function getInvestigations(
  getToken: GetToken,
  longCaseId: string,
  { signal }: CallOptions = {},
): Promise<InvestigationRead[]> {
  return apiRequest<InvestigationRead[]>(`${BASE_PATH}/${longCaseId}/investigations`, { getToken, signal });
}

export function getInvestigationById(
  getToken: GetToken,
  longCaseId: string,
  itemId: string,
  { signal }: CallOptions = {},
): Promise<InvestigationRead | null> {
  return apiRequestOrNull<InvestigationRead>(`${BASE_PATH}/${longCaseId}/investigations/${itemId}`, {
    getToken,
    signal,
  });
}

// Admin endpoints

export function createLongCase(
  getToken: GetToken,
  longCase: Partial<LongCaseWrite>,
  { signal }: CallOptions = {},
): Promise<LongCaseDetail> {
  return apiRequest<LongCaseDetail>(BASE_PATH, { method: "POST", body: longCase, getToken, signal });
}

export function updateLongCase(
  getToken: GetToken,
  longCaseId: string,
  longCase: Partial<LongCaseWrite>,
  { signal }: CallOptions = {},
): Promise<LongCaseDetail> {
  return apiRequest<LongCaseDetail>(`${BASE_PATH}/${longCaseId}`, { method: "PATCH", body: longCase, getToken, signal });
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
  payload: LongCaseWrite,
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
  payload: LongCaseWrite,
  { signal }: CallOptions = {},
): Promise<LongCaseDetail> {
  return apiRequest<LongCaseDetail>(`${BASE_PATH}/${longCaseId}/details`, {
    method: "PUT",
    body: payload,
    getToken,
    signal,
  });
}
