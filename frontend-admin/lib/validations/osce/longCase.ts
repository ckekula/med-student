import { z } from "zod";
import {
  DIFFICULTY_LEVEL,
  EXAMINATION_NAME,
  HISTORY_ITEM_CATEGORY,
  INVESTIGATION_NAME,
  LONG_CASE_CATEGORY,
  SEX,
  SPECIALTY
} from "@medstudent/api-types/enums";

export const MAX_POINTS = 100;
export const MAX_ITEMS_PER_SECTION = 100;

const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} must be at most ${max} characters`);

const optionalText = (label: string, max: number) =>
  z.string().trim().max(max, `${label} must be at most ${max} characters`);

const points = z
  .number({ error: "Enter a number" })
  .int("Points must be a whole number")
  .min(0, "Points cannot be negative")
  .max(MAX_POINTS, `Points cannot exceed ${MAX_POINTS}`);

/** Id of the persisted row when editing; `null` for rows that don't exist yet. */
const serverId = z.string().nullable();

/** One feature per line in the form; blank lines are ignored. */
export function parseFeatureLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export const patientProfileSchema = z.object({
  name: optionalText("Name", 100),
  age: z
    .number({ error: "Enter a valid age" })
    .int("Age must be a whole number")
    .min(0, "Age cannot be negative")
    .max(120, "Age cannot exceed 120")
    .nullable(),
  sex: z.union([z.literal(""), z.enum(SEX)]),
  occupation: optionalText("Occupation", 150),
  location: optionalText("Location", 150),
  marital_status: optionalText("Marital status", 50),
  height_cm: z
    .number({ error: "Enter a valid height" })
    .positive("Height must be greater than 0")
    .max(300, "Height cannot exceed 300 cm")
    .nullable(),
  weight_kg: z
    .number({ error: "Enter a valid weight" })
    .positive("Weight must be greater than 0")
    .max(700, "Weight cannot exceed 700 kg")
    .nullable(),
});

export const historyItemSchema = z.object({
  serverId,
  category: z.enum(HISTORY_ITEM_CATEGORY),
  description: requiredText("Description", 2000),
  points,
});

export const examinationSchema = z.object({
  serverId,
  name: z.enum(EXAMINATION_NAME),
  findings: requiredText("Findings", 2000),
  points,
});

export const investigationSchema = z.object({
  serverId,
  name: z.enum(INVESTIGATION_NAME),
  findings: requiredText("Findings", 2000),
  points,
});

export const differentialDiagnosisSchema = z.object({
  serverId,
  primary_diagnosis: requiredText("Primary diagnosis", 200),
  secondary_diagnosis: requiredText("Secondary diagnosis", 200),
  etiology: requiredText("Etiology", 500),
  location_laterality: requiredText("Location/laterality", 500),
  severity_stage: requiredText("Severity/stage", 500),
  complications: requiredText("Complications", 1000),
});

export const longCaseFormSchema = z.object({
  title: requiredText("Title", 200),
  specialty: z.enum(SPECIALTY),
  // NOT NULL in the database.
  category: z.enum(LONG_CASE_CATEGORY, { error: "Select a category" }),
  difficulty: z.enum(DIFFICULTY_LEVEL),
  description: optionalText("Description", 2000),
  is_active: z.boolean(),
  patient_profile: patientProfileSchema,
  history_items: z.array(historyItemSchema).max(MAX_ITEMS_PER_SECTION),
  examinations: z.array(examinationSchema).max(MAX_ITEMS_PER_SECTION),
  investigations: z.array(investigationSchema).max(MAX_ITEMS_PER_SECTION),
  differential_diagnosis: differentialDiagnosisSchema.nullable(),
})
  // The database has a unique (long case, name) constraint on both tables.
  .superRefine((values, ctx) => {
    const uniqueNamed = [
      ["examinations", "Each examination can only be added once"],
      ["investigations", "Each investigation can only be added once"],
    ] as const;

    for (const [section, message] of uniqueNamed) {
      const seen = new Set<string>();
      values[section].forEach((item, index) => {
        if (seen.has(item.name)) ctx.addIssue({ code: "custom", message, path: [section, index, "name"] });
        seen.add(item.name);
      });
    }
  });

// No transforms/defaults, so form input and output types are identical.
export type LongCaseFormValues = z.infer<typeof longCaseFormSchema>;
export type PatientProfileFormValues = z.infer<typeof patientProfileSchema>;
export type HistoryItemFormValues = z.infer<typeof historyItemSchema>;
export type ExaminationFormValues = z.infer<typeof examinationSchema>;
export type InvestigationFormValues = z.infer<typeof investigationSchema>;
export type DifferentialDiagnosisFormValues = z.infer<typeof differentialDiagnosisSchema>;
