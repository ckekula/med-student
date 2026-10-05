"use client";

import { useId } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { LuArrowDown, LuArrowUp } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createEmptyDifferential } from "@/lib/osce/longCaseMappers";
import type { LongCaseFormValues } from "@/lib/validations/osce/longCase";
import { FormField, fieldA11y } from "./form-field";
import { ItemCard, RepeatableSection } from "./repeatable-section";

export function DifferentialsSection() {
  const { control } = useFormContext<LongCaseFormValues>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "differential_diagnoses" });

  return (
    <RepeatableSection
      title="Differential diagnoses"
      description="Ordered by priority: the first entry is the most likely diagnosis."
      addLabel="Add diagnosis"
      onAdd={() => append(createEmptyDifferential())}
      isEmpty={fields.length === 0}
      emptyMessage="No differential diagnoses yet."
    >
      {fields.map((field, index) => (
        <DifferentialRow
          key={field.id}
          index={index}
          isFirst={index === 0}
          isLast={index === fields.length - 1}
          onRemove={() => remove(index)}
          onMove={(to) => move(index, to)}
        />
      ))}
    </RepeatableSection>
  );
}

interface DifferentialRowProps {
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onRemove: () => void;
  onMove: (to: number) => void;
}

function DifferentialRow({ index, isFirst, isLast, onRemove, onMove }: DifferentialRowProps) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const {
    register,
    formState: { errors },
  } = useFormContext<LongCaseFormValues>();
  const rowErrors = errors.differential_diagnoses?.[index];
  const title = `Diagnosis ${index + 1}`;

  return (
    <ItemCard
      title={title}
      onRemove={onRemove}
      actions={
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Move ${title} up`}
            disabled={isFirst}
            onClick={() => onMove(index - 1)}
          >
            <LuArrowUp aria-hidden="true" className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Move ${title} down`}
            disabled={isLast}
            onClick={() => onMove(index + 1)}
          >
            <LuArrowDown aria-hidden="true" className="size-4" />
          </Button>
        </>
      }
    >
      <FormField id={id("diagnosis")} label="Diagnosis" required error={rowErrors?.diagnosis}>
        <Input
          {...fieldA11y(id("diagnosis"), rowErrors?.diagnosis)}
          {...register(`differential_diagnoses.${index}.diagnosis`)}
        />
      </FormField>

      <FormField
        id={id("features")}
        label="Supporting features"
        required
        description="One feature per line."
        error={rowErrors?.supporting_features}
      >
        <Textarea
          rows={4}
          {...fieldA11y(id("features"), rowErrors?.supporting_features)}
          {...register(`differential_diagnoses.${index}.supporting_features`)}
        />
      </FormField>
    </ItemCard>
  );
}
