// Enums
export type LongCaseSpecialty = 'Medicine' | 'Surgery' | 'Paediatrics' | 'GynObs' | 'Psychiatry';
export type DifficultyLevel = 'Final MBBS' | 'Post Graduate';
export type LongCaseCategory =
  | 'Breast'
  | 'Respiratory'
  | 'Musculoskeletal'
  | 'Neurological'
  | 'Endocrine'
  | 'Cardiovascular'
  | 'Gastrointestinal'
  | 'Obstretics'
  | 'Psychiatric';
export type ExaminationName = 'Physical' | 'Neurological' | 'Respiratory' | 'Cardiovascular' | 'Gastrointestinal';

// TODO: replace with the values of the backend enums.
export type HistoryItemCategory = string;
export type InvestigationName = string;

export interface LongCase {
  id: string;
  title: string;
  specialty: LongCaseSpecialty;
  category: LongCaseCategory | null;
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
  sex: string | null;
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
  is_critical: boolean;
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
  diagnosis: string;
  supporting_features: string[];
  priority: number;
  created_at: string;
  updated_at: string;
}

/** Response of GET /long-cases/{id}/details */
export interface LongCaseDetail extends LongCase {
  patient_profile: PatientProfile | null;
  history_items: HistoryItem[];
  examinations: Examination[];
  investigations: Investigation[];
  differential_diagnoses: DifferentialDiagnosis[];
}

// Query params
export interface LongCaseListParams {
  specialty?: LongCaseSpecialty;
  is_active?: boolean;
  skip?: number;
  limit?: number;
}
