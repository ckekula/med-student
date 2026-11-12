import type {
  DifficultyLevel,
  ExaminationName,
  HistoryItemCategory,
  InvestigationName,
  LongCaseCategory,
  LongCaseSpecialty,
  Sex,
} from "@/lib/osce/longCaseOptions";

// Enums live in `@/lib/osce/longCaseOptions` (single source of truth); re-exported for existing imports.
export type {
  DifficultyLevel,
  ExaminationName,
  HistoryItemCategory,
  InvestigationName,
  LongCaseCategory,
  LongCaseSpecialty,
};

export interface LongCase {
  id: string;
  title: string;
  specialty: LongCaseSpecialty;
  category: LongCaseCategory; // NOT NULL in the database
  difficulty: DifficultyLevel;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientProfile {
  id: string;
  long_case_id: string;
  name: string | null;
  age: number | null;
  sex: Sex | null;
  occupation: string | null;
  location: string | null;
  marital_status: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  created_at: string;
  updated_at: string;
}

export interface HistoryItem {
  id: string;
  long_case_id: string;
  category: HistoryItemCategory;
  description: string;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface Examination {
  id: string;
  long_case_id: string;
  name: ExaminationName;
  findings: string;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface Investigation {
  id: string;
  long_case_id: string;
  name: InvestigationName;
  findings: string;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface DifferentialDiagnosis {
  id: string;
  long_case_id: string;
  primary_diagnosis: string;
  secondary_diagnosis: string | null;
  etiology: string | null;
  location_laterality: string | null;
  severity_stage: string | null;
  complications: string | null;
  created_at: string;
  updated_at: string;
}

/** Response of GET /long-cases/{id}/details */
export interface LongCaseDetail extends LongCase {
  patient_profile: PatientProfile | null;
  history_items: HistoryItem[];
  examinations: Examination[];
  investigations: Investigation[];
  differential_diagnosis: DifferentialDiagnosis | null;
}

// Query params
export interface LongCaseListParams {
  specialty?: LongCaseSpecialty;
  is_active?: boolean;
  skip?: number;
  limit?: number;
}

// Write payloads (POST /long-cases/full, PUT /long-cases/{id}/details)

type ServerFields = "id" | "long_case_id" | "created_at" | "updated_at";

/** Child row on write: `id` present = update that row, absent = create it. */
type ChildInput<T> = Omit<T, ServerFields> & { id?: string };

export type PatientProfileInput = Omit<PatientProfile, ServerFields>;
export type HistoryItemInput = ChildInput<HistoryItem>;
export type ExaminationInput = ChildInput<Examination>;
export type InvestigationInput = ChildInput<Investigation>;
export type DifferentialDiagnosisInput = ChildInput<DifferentialDiagnosis>;

export interface LongCaseWritePayload
  extends Pick<LongCase, "title" | "specialty" | "category" | "difficulty" | "description" | "is_active"> {
  patient_profile: PatientProfileInput | null;
  history_items: HistoryItemInput[];
  examinations: ExaminationInput[];
  investigations: InvestigationInput[];
  differential_diagnosis: DifferentialDiagnosisInput | null;
}
