import type { components, operations } from "../api-schema";

export type LongCaseSpecialty = components["schemas"]["Specialty"];
export type DifficultyLevel = components["schemas"]["DifficultyLevel"];
export type LongCaseCategory = components["schemas"]["LongCaseCategory"];
export type Sex = components["schemas"]["Sex"];

export type ExaminationName = components["schemas"]["ExaminationName"];
export type InvestigationName = components["schemas"]["InvestigationName"];
export type HistoryItemCategory = components["schemas"]["HistoryItemCategory"];

export type LongCaseRead = components["schemas"]["LongCaseRead"];
export type LongCaseWrite = components["schemas"]["LongCaseWrite"];
export type LongCaseUpdate = components["schemas"]["LongCaseUpdate"];
export type LongCaseDetail = components["schemas"]["LongCaseDetail"];

export type PatientProfileRead = components["schemas"]["PatientProfileRead"];
export type PatientProfileUpdate = components["schemas"]["PatientProfileUpdate"];

export type HistoryItemRead = components["schemas"]["HistoryItemRead"];
export type HistoryItemWrite = components["schemas"]["HistoryItemWrite"];
export type HistoryItemUpdate = components["schemas"]["HistoryItemUpdate"];

export type ExaminationRead = components["schemas"]["LongCaseExaminationRead"];
export type ExaminationWrite = components["schemas"]["LongCaseExaminationWrite"];
export type ExaminationUpdate = components["schemas"]["LongCaseExaminationUpdate"];

export type InvestigationRead = components["schemas"]["LongCaseInvestigationRead"];
export type InvestigationWrite = components["schemas"]["LongCaseInvestigationWrite"];
export type InvestigationUpdate = components["schemas"]["LongCaseInvestigationUpdate"];

export type LongCaseListParams = operations["list_long_cases_api_v1_long_cases_get"]["parameters"]["query"];
