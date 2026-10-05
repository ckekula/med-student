"use client";

import { useId } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { HISTORY_ITEM_CATEGORY_OPTIONS } from "@/lib/osce/longCaseOptions";
import { createEmptyHistoryItem } from "@/lib/osce/longCaseMappers";
import { MAX_POINTS, type LongCaseFormValues } from "@/lib/validations/osce/longCase";
import { FormField, fieldA11y } from "./form-field";
import { OptionSelect } from "./option-select";
import { ItemCard, RepeatableSection } from "./repeatable-section";

export function HistorySection() {
  const { control } = useFormContext<LongCaseFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "history_items" });

  return (
    <RepeatableSection
      title="History items"
      description="Questions a student should ask. Mark the ones that are essential as critical."
      addLabel="Add history item"
      onAdd={() => append(createEmptyHistoryItem())}
      isEmpty={fields.length === 0}
      emptyMessage="No history items yet."
    >
      {fields.map((field, index) => (
        <HistoryItemRow key={field.id} index={index} onRemove={() => remove(index)} />
      ))}
    </RepeatableSection>
  );
}

function HistoryItemRow({ index, onRemove }: { index: number; onRemove: () => void }) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<LongCaseFormValues>();
  const rowErrors = errors.history_items?.[index];

  return (
    <ItemCard title={`History item ${index + 1}`} onRemove={onRemove}>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
        <FormField id={id("category")} label="Category" required error={rowErrors?.category}>
          <Controller
            control={control}
            name={`history_items.${index}.category`}
            render={({ field }) => (
              <OptionSelect
                {...fieldA11y(id("category"), rowErrors?.category)}
                value={field.value}
                onChange={field.onChange}
                options={HISTORY_ITEM_CATEGORY_OPTIONS}
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
            {...register(`history_items.${index}.points`, { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <FormField id={id("description")} label="Description" required error={rowErrors?.description}>
        <Textarea
          rows={3}
          {...fieldA11y(id("description"), rowErrors?.description)}
          {...register(`history_items.${index}.description`)}
        />
      </FormField>

      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name={`history_items.${index}.is_critical`}
          render={({ field }) => (
            <Switch id={id("critical")} checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Label htmlFor={id("critical")}>Critical item</Label>
      </div>
    </ItemCard>
  );
}
