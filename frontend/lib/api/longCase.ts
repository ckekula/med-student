import { apiRequest, apiRequestOrNull, type CallOptions, type GetToken } from "@/lib/api/client";
import type {
  Examination,
  HistoryItem,
  Investigation,
  LongCase,
  LongCaseDetail,
  LongCaseListParams,
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
