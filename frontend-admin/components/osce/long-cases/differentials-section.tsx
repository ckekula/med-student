"use client";

import { useId } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { createEmptyDifferential } from "@/lib/osce/longCaseMappers";
import type { LongCaseFormValues } from "@/lib/validations/osce/longCase";
import { FormField, fieldA11y } from "./form-field";
import { ItemCard, RepeatableSection } from "./repeatable-section";

export function DifferentialsSection() {
  const { control, setValue } = useFormContext<LongCaseFormValues>();
  const differential = useWatch({ control, name: "differential_diagnosis" });

  return (
    <RepeatableSection
      title="Differential diagnosis"
      description="Each long case can have one differential diagnosis."
      addLabel="Add diagnosis"
      onAdd={() => setValue("differential_diagnosis", createEmptyDifferential(), { shouldDirty: true })}
      isEmpty={!differential}
      emptyMessage="No differential diagnosis yet."
    >
      {differential && (
        <DifferentialRow
          onRemove={() => setValue("differential_diagnosis", null, { shouldDirty: true })}
        />
      )}
    </RepeatableSection>
  );
}

interface DifferentialRowProps {
  onRemove: () => void;
}

function DifferentialRow({ onRemove }: DifferentialRowProps) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const {
    register,
    formState: { errors },
  } = useFormContext<LongCaseFormValues>();
  const rowErrors = errors.differential_diagnosis;
  const registerField = (field: keyof NonNullable<LongCaseFormValues["differential_diagnosis"]>) =>
    register(`differential_diagnosis.${field}`);

  return (
    <ItemCard title="Differential diagnosis" onRemove={onRemove}>
      {(["primary_diagnosis", "secondary_diagnosis", "etiology", "location_laterality", "severity_stage", "complications"] as const).map(
        (field) => (
          <FormField key={field} id={id(field)} label={field.replaceAll("_", " ")} required error={rowErrors?.[field]}>
            <Textarea
              rows={field === "complications" ? 3 : 2}
              {...fieldA11y(id(field), rowErrors?.[field])}
              {...registerField(field)}
            />
          </FormField>
        ),
      )}
    </ItemCard>
  );
}
