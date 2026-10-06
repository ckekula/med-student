/**
 * Single source of truth for the long-case enums.
 * Values must match the backend enums exactly (they are sent over the wire);
 * labels are display-only.
 */

export interface Option<T extends string> {
  readonly value: T;
  readonly label: string;
}

function buildOptions<T extends string>(
  values: readonly T[],
  labels: Readonly<Record<T, string>>,
): readonly Option<T>[] {
  return values.map((value) => ({ value, label: labels[value] }));
}

export const SEX = ["male", "female"] as const;
export type Sex = (typeof SEX)[number];
export const SEX_LABELS: Readonly<Record<Sex, string>> = {
  male: "Male",
  female: "Female",
};
export const SEX_OPTIONS = buildOptions(SEX, SEX_LABELS);

// Specialty
export const LONG_CASE_SPECIALTIES = ["medicine", "surgery", "paediatrics", "gynobs", "psychiatry"] as const;
export type LongCaseSpecialty = (typeof LONG_CASE_SPECIALTIES)[number];
export const SPECIALTY_LABELS: Readonly<Record<LongCaseSpecialty, string>> = {
  medicine: "Medicine",
  surgery: "Surgery",
  paediatrics: "Paediatrics",
  gynobs: "Gynaecology & Obstetrics",
  psychiatry: "Psychiatry",
};
export const SPECIALTY_OPTIONS = buildOptions(LONG_CASE_SPECIALTIES, SPECIALTY_LABELS);

// Difficulty
export const DIFFICULTY_LEVELS = ["final_mbbs", "post_graduate"] as const;
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];
export const DIFFICULTY_LABELS: Readonly<Record<DifficultyLevel, string>> = {
  "final_mbbs": "Final MBBS",
  "post_graduate": "Post Graduate",
};
export const DIFFICULTY_OPTIONS = buildOptions(DIFFICULTY_LEVELS, DIFFICULTY_LABELS);

// Category
export const LONG_CASE_CATEGORIES = [
  "chest_pain",
  "Respiratory",
  "Musculoskeletal",
  "Neurological",
  "Endocrine",
  "Cardiovascular",
  "Gastrointestinal",
  "Obstretics",
  "Psychiatric",
] as const;
export type LongCaseCategory = (typeof LONG_CASE_CATEGORIES)[number];
export const CATEGORY_LABELS: Readonly<Record<LongCaseCategory, string>> = {
  chest_pain: "Chest Pain",
  Respiratory: "Respiratory",
  Musculoskeletal: "Musculoskeletal",
  Neurological: "Neurological",
  Endocrine: "Endocrine",
  Cardiovascular: "Cardiovascular",
  Gastrointestinal: "Gastrointestinal",
  Obstretics: "Obstetrics",
  Psychiatric: "Psychiatric",
};
export const CATEGORY_OPTIONS = buildOptions(LONG_CASE_CATEGORIES, CATEGORY_LABELS);

// Examination
export const EXAMINATION_NAMES = ["Physical", "Neurological", "Respiratory", "Cardiovascular", "Gastrointestinal"] as const;
export type ExaminationName = (typeof EXAMINATION_NAMES)[number];
export const EXAMINATION_LABELS: Readonly<Record<ExaminationName, string>> = {
  Physical: "Physical",
  Neurological: "Neurological",
  Respiratory: "Respiratory",
  Cardiovascular: "Cardiovascular",
  Gastrointestinal: "Gastrointestinal",
};
export const EXAMINATION_OPTIONS = buildOptions(EXAMINATION_NAMES, EXAMINATION_LABELS);

// History item category
export const HISTORY_ITEM_CATEGORIES = [
  "presenting_complaint",
  "history_of_presenting_complaint",
  "past_medical_history",
  "past_surgical_history",
  "medication_history",
  "allergy_history",
  "family_history",
  "social_history",
] as const;
export type HistoryItemCategory = (typeof HISTORY_ITEM_CATEGORIES)[number];
export const HISTORY_ITEM_CATEGORY_LABELS: Readonly<Record<HistoryItemCategory, string>> = {
  presenting_complaint: "Presenting complaint",
  history_of_presenting_complaint: "History of presenting complaint",
  past_medical_history: "Past medical history",
  past_surgical_history: "Past surgical history",
  medication_history: "Medication history",
  allergy_history: "Allergy history",
  family_history: "Family history",
  social_history: "Social history",
};
export const HISTORY_ITEM_CATEGORY_OPTIONS = buildOptions(HISTORY_ITEM_CATEGORIES, HISTORY_ITEM_CATEGORY_LABELS);

// Investigation
export const INVESTIGATION_NAMES = ["Full Blood Count", "X Ray", "CT Scan"] as const;
export type InvestigationName = (typeof INVESTIGATION_NAMES)[number];
export const INVESTIGATION_LABELS: Readonly<Record<InvestigationName, string>> = {
  "Full Blood Count": "Full Blood Count",
  "X Ray": "X Ray",
  "CT Scan": "CT Scan",
};
export const INVESTIGATION_OPTIONS = buildOptions(INVESTIGATION_NAMES, INVESTIGATION_LABELS);
