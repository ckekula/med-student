import type { DefaultValues } from "react-hook-form";
import {
  parseFeatureLines,
  type DifferentialDiagnosisFormValues,
  type ExaminationFormValues,
  type HistoryItemFormValues,
  type InvestigationFormValues,
  type LongCaseFormValues,
  type PatientProfileFormValues,
} from "@/lib/validations/osce/longCase";
import {
  EXAMINATION_NAMES,
  HISTORY_ITEM_CATEGORIES,
  INVESTIGATION_NAMES,
  type ExaminationName,
  type InvestigationName,
} from "@/lib/osce/longCaseOptions";
import type { LongCaseDetail, LongCaseWritePayload, PatientProfileInput } from "@/types/osce/longCase";

// Form defaults

export const createEmptyHistoryItem = (): HistoryItemFormValues => ({
  serverId: null,
  category: HISTORY_ITEM_CATEGORIES[0],
  description: "",
  points: 1,
});

/** Names are unique per case, so a new row starts on the first name not used yet. */
const firstUnused = <T extends string>(all: readonly T[], used: readonly T[]): T =>
  all.find((value) => !used.includes(value)) ?? all[0];

export const createEmptyExamination = (used: readonly ExaminationName[] = []): ExaminationFormValues => ({
  serverId: null,
  name: firstUnused(EXAMINATION_NAMES, used),
  findings: "",
  points: 1,
});

export const createEmptyInvestigation = (used: readonly InvestigationName[] = []): InvestigationFormValues => ({
  serverId: null,
  name: firstUnused(INVESTIGATION_NAMES, used),
  findings: "",
  points: 1,
});

export const createEmptyDifferential = (): DifferentialDiagnosisFormValues => ({
  serverId: null,
  diagnosis: "",
  supporting_features: "",
});

/** `category` is intentionally unset: the admin must choose one. */
export function createEmptyFormValues(): DefaultValues<LongCaseFormValues> {
  return {
    title: "",
    specialty: "medicine",
    difficulty: "final_mbbs",
    description: "",
    // New cases start as drafts so they aren't visible to students half-finished.
    is_active: false,
    patient_profile: {
      name: "",
      age: null,
      sex: "",
      occupation: "",
      location: "",
      marital_status: "",
      height_cm: null,
      weight_kg: null,
    },
    history_items: [],
    examinations: [],
    investigations: [],
    differential_diagnoses: [],
  };
}

// API -> form

export function toFormValues(detail: LongCaseDetail): LongCaseFormValues {
  const profile = detail.patient_profile;

  return {
    title: detail.title,
    specialty: detail.specialty,
    category: detail.category,
    difficulty: detail.difficulty,
    description: detail.description ?? "",
    is_active: detail.is_active,
    patient_profile: {
      name: profile?.name ?? "",
      age: profile?.age ?? null,
      sex: profile?.sex ?? "",
      occupation: profile?.occupation ?? "",
      location: profile?.location ?? "",
      marital_status: profile?.marital_status ?? "",
      height_cm: profile?.height_cm ?? null,
      weight_kg: profile?.weight_kg ?? null,
    },
    history_items: detail.history_items.map((item) => ({
      serverId: item.id,
      category: item.category,
      description: item.description,
      points: item.points,
    })),
    examinations: detail.examinations.map((item) => ({
      serverId: item.id,
      name: item.name,
      findings: item.findings,
      points: item.points,
    })),
    investigations: detail.investigations.map((item) => ({
      serverId: item.id,
      name: item.name,
      findings: item.findings,
      points: item.points,
    })),
    differential_diagnoses: [...detail.differential_diagnoses]
      .sort((a, b) => a.priority - b.priority)
      .map((item) => ({
        serverId: item.id,
        diagnosis: item.diagnosis,
        supporting_features: item.supporting_features.join("\n"),
      })),
  };
}

// Form -> API

const blankToNull = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const withId = <T extends object>(serverId: string | null, fields: T): T & { id?: string } =>
  serverId ? { id: serverId, ...fields } : fields;

function toPatientProfileInput(profile: PatientProfileFormValues): PatientProfileInput | null {
  const input: PatientProfileInput = {
    name: blankToNull(profile.name),
    age: profile.age,
    sex: profile.sex === "" ? null : profile.sex,
    occupation: blankToNull(profile.occupation),
    location: blankToNull(profile.location),
    marital_status: blankToNull(profile.marital_status),
    height_cm: profile.height_cm,
    weight_kg: profile.weight_kg,
  };

  // A completely blank profile is stored as "no profile".
  return Object.values(input).every((value) => value === null) ? null : input;
}

export function toWritePayload(values: LongCaseFormValues): LongCaseWritePayload {
  return {
    title: values.title.trim(),
    specialty: values.specialty,
    category: values.category,
    difficulty: values.difficulty,
    description: blankToNull(values.description),
    is_active: values.is_active,
    patient_profile: toPatientProfileInput(values.patient_profile),
    history_items: values.history_items.map(({ serverId, ...fields }) => withId(serverId, fields)),
    examinations: values.examinations.map(({ serverId, ...fields }) => withId(serverId, fields)),
    investigations: values.investigations.map(({ serverId, ...fields }) => withId(serverId, fields)),
    // Priority is the position in the list.
    differential_diagnoses: values.differential_diagnoses.map(({ serverId, diagnosis, supporting_features }, index) =>
      withId(serverId, {
        diagnosis,
        supporting_features: parseFeatureLines(supporting_features),
        priority: index + 1,
      }),
    ),
  };
}
