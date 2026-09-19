export interface LongCase {
  id: string;
  title: string;
  specialty: LongCaseSpecialty;
  category: LongCaseCategory;
  difficulty: DifficultyLevel;
  description: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatientProfile {
  id: string;
  long_case_id: string;
  name: string;
  age: number;
  sex: "male" | "female";
  occupation: string;
  location: string;
  marital_status: string;
  height_cm: number;
  weight_kg: number;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryItem {
  id: string;
  long_case_id: string;
  category: string;
  description: string;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface Examination {
  id: string;
  long_case_id: string;
  name: ExaminationName;
  findings: string;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface Investigation {
  id: string;
  long_case_id: string;
  name: string;
  findings: string;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface DifferentialDiagnosis {
  id: string;
  long_case_id: string;
  diagnosis: string;
  supporting_features: string[];
  priority: number;
  createdAt: string;
  updatedAt: string;
}

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
