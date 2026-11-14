/**
 * Single source of truth for the long-case enums.
 * Values must match the backend enums exactly (they are sent over the wire);
 * labels are display-only.
 */
import {
  Sex,
  LongCaseSpecialty,
  LongCaseCategory,
  DifficultyLevel,
  ExaminationName,
  InvestigationName,
  HistoryItemCategory,
} from "@/types/osce/longCase";

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

export const SEX_LABELS: Readonly<Record<Sex, string>> = {
  male: "Male",
  female: "Female",
};

export const SEX_OPTIONS = buildOptions(
  Object.keys(SEX_LABELS) as Sex[],
  SEX_LABELS
);

// Specialty
export const SPECIALTY_LABELS: Readonly<Record<LongCaseSpecialty, string>> = {
  medicine: "Medicine",
  surgery: "Surgery",
  paediatrics: "Paediatrics",
  gynobs: "Gynaecology & Obstetrics",
  psychiatry: "Psychiatry",
};
export const SPECIALTY_OPTIONS = buildOptions(
  Object.keys(SPECIALTY_LABELS) as LongCaseSpecialty[],
  SPECIALTY_LABELS
);

// Difficulty
export const DIFFICULTY_LABELS: Readonly<Record<DifficultyLevel, string>> = {
  "final_mbbs": "Final MBBS",
  "post_graduate": "Post Graduate",
};
export const DIFFICULTY_OPTIONS = buildOptions(
  Object.keys(DIFFICULTY_LABELS) as DifficultyLevel[],
  DIFFICULTY_LABELS
);

// Category
export const CATEGORY_LABELS: Readonly<Record<LongCaseCategory, string>> = {
  chest_pain: "Chest Pain",
  acute_fever: "Acute Fever",
  prolonged_fever_PUO: "Prolonged Fever (PUO)",
  diabetes_mellitus: "Diabetes Mellitus",
  hypertension: "Hypertension",
  shortness_of_breath: "Shortness of Breath",
  fever_with_respiratory_symptoms_RTI: "Fever with Respiratory Symptoms (RTI)",
  chronic_cough_and_hemoptysis: "Chronic Cough and Hemoptysis",
  swelling_of_the_body_edema: "Swelling of the Body (Edema)",
  jaundice: "Jaundice",
  CLCD: "Chronic Liver Disease",
  joint_pain: "Joint Pain",
  bleeding_disorders: "Bleeding Disorders",
  chronic_kidney_disease: "Chronic Kidney Disease",
  lower_limb_weakness: "Lower Limb Weakness",
  hemiparesis: "Hemiparesis",
  connective_tissue_disease: "Connective Tissue Disease",
  anemia: "Anemia",
  stroke: "Stroke",
  chronic_diarrhea: "Chronic Diarrhea",
  thyroid_disorders: "Thyroid Disorders",
  breast_carcinoma: "Breast Carcinoma",
  upper_gastroenterology: "Upper Gastroenterology",
  hepatopancreatobiliary: "Hepatopancreatobiliary",
  colorectal: "Colorectal",
  vascular: "Vascular",
  urology: "Urology",
  depression: "Depression",
  anxiety_disorders: "Anxiety Disorders",
  psychosis: "Psychosis",
  bipolar_disorder: "Bipolar Disorder",
  substance_use_disorders: "Substance Use Disorders",
  neonatal_disorders: "Neonatal Disorders",
  infectious_diseases: "Infectious Diseases",
  respiratory_disorders: "Respiratory Disorders",
  gastrointestinal_disorders: "Gastrointestinal Disorders",
  neurological_disorders: "Neurological Disorders",
  obstetric_complications: "Obstetric Complications",
  gynecological_disorders: "Gynaecological Disorders",
  reproductive_health_issues: "Reproductive Health Issues"
}
export const CATEGORY_OPTIONS = buildOptions(
  Object.keys(CATEGORY_LABELS) as LongCaseCategory[],
  CATEGORY_LABELS
);

// Examination
export const EXAMINATION_LABELS: Readonly<Record<ExaminationName, string>> = {
  tendon_xanthomas: "Tendon Xanthomas",
  peripheral_embolic_stigmata: "Peripheral Embolic Stigmata",
  pulses: "Pulses",
  clubbing: "Clubbing",
  buergers_test: "Buerger's Test",
  "capillary_refill_time": "Capillary Refill Time",
};
export const EXAMINATION_OPTIONS = buildOptions(
  Object.keys(EXAMINATION_LABELS) as ExaminationName[],
  EXAMINATION_LABELS
);

// History item category
export const HISTORY_ITEM_CATEGORY_LABELS: Readonly<Record<HistoryItemCategory, string>> = {
  presenting_complaint: "Presenting complaint",
  history_of_presenting_complaint: "History of presenting complaint",
  associated_symptoms: "Associated symptoms",
  past_medical_history: "Past medical history",
  past_surgical_history: "Past surgical history",
  medication_history: "Medication history",
  allergy_history: "Allergy history",
  family_history: "Family history",
  social_history: "Social history",
  antinatal_history: "Antinatal history",
  birth_history: "Birth history",
  developmental_history: "Developmental history",
  nutrition_history: "Nutrition history",
  vaccination_history: "Vaccination history",
  past_gynaecological_history: "Past gynaecological history",
  past_obstetric_history: "Past obstetric history",
  past_menstrual_history: "Past menstrual history"
};
export const HISTORY_ITEM_CATEGORY_OPTIONS = buildOptions(
  Object.keys(HISTORY_ITEM_CATEGORY_LABELS) as HistoryItemCategory[],
  HISTORY_ITEM_CATEGORY_LABELS
);

// Investigation
export const INVESTIGATION_LABELS: Readonly<Record<InvestigationName, string>> = {
  full_blood_count: "Full Blood Count",
  x_ray: "X Ray",
  ct_scan: "CT Scan",
  mri_scan: "MRI Scan",
  mr_angiography: "MR Angiography",
  ultrasound: "Ultrasound",
};
export const INVESTIGATION_OPTIONS = buildOptions(
  Object.keys(INVESTIGATION_LABELS) as InvestigationName[],
  INVESTIGATION_LABELS
);
