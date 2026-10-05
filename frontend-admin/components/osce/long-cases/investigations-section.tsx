"use client";

import { useId } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { INVESTIGATION_OPTIONS } from "@/lib/osce/longCaseOptions";
import { createEmptyInvestigation } from "@/lib/osce/longCaseMappers";
import { MAX_POINTS, type LongCaseFormValues } from "@/lib/validations/osce/longCase";
import { FormField, fieldA11y } from "./form-field";
import { OptionSelect } from "./option-select";
import { ItemCard, RepeatableSection } from "./repeatable-section";

export function InvestigationsSection() {
  const { control, getValues } = useFormContext<LongCaseFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "investigations" });

  return (
    <RepeatableSection
      title="Investigations"
      description="Results revealed when a student orders each investigation."
      addLabel="Add investigation"
      onAdd={() => append(createEmptyInvestigation(getValues("investigations").map((item) => item.name)))}
      isEmpty={fields.length === 0}
      emptyMessage="No investigations yet."
    >
      {fields.map((field, index) => (
        <InvestigationRow key={field.id} index={index} onRemove={() => remove(index)} />
      ))}
    </RepeatableSection>
  );
}

function InvestigationRow({ index, onRemove }: { index: number; onRemove: () => void }) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<LongCaseFormValues>();
  const rowErrors = errors.investigations?.[index];

  return (
    <ItemCard title={`Investigation ${index + 1}`} onRemove={onRemove}>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
        <FormField id={id("name")} label="Investigation" required error={rowErrors?.name}>
          <Controller
            control={control}
            name={`investigations.${index}.name`}
            render={({ field }) => (
              <OptionSelect
                {...fieldA11y(id("name"), rowErrors?.name)}
                value={field.value}
                onChange={field.onChange}
                options={INVESTIGATION_OPTIONS}
              />
            )}
          />
        </FormField>
        <FormField id={id("points")} label="Points" required error={rowErrors?.points}>
          <Input
            type="number"
            min={0}
            max={MAX_POINTS}
            step={1}
            inputMode="numeric"
            {...fieldA11y(id("points"), rowErrors?.points)}
            {...register(`investigations.${index}.points`, { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <FormField id={id("findings")} label="Findings" required error={rowErrors?.findings}>
        <Textarea
          rows={3}
          {...fieldA11y(id("findings"), rowErrors?.findings)}
          {...register(`investigations.${index}.findings`)}
        />
      </FormField>
    </ItemCard>
  );
}
