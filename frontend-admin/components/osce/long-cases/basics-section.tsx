"use client";

import { useId } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CATEGORY_OPTIONS, DIFFICULTY_OPTIONS, SPECIALTY_OPTIONS } from "@/lib/osce/longCaseOptions";
import type { LongCaseFormValues } from "@/lib/validations/osce/longCase";
import { FormField, fieldA11y } from "./form-field";
import { OptionSelect } from "./option-select";

export function BasicsSection() {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<LongCaseFormValues>();

  return (
    <div className="grid gap-5">
      <FormField id={id("title")} label="Title" required error={errors.title}>
        <Input {...fieldA11y(id("title"), errors.title)} placeholder="e.g. 55-year-old with chest pain" {...register("title")} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField id={id("specialty")} label="Specialty" required error={errors.specialty}>
          <Controller
            control={control}
            name="specialty"
            render={({ field }) => (
              <OptionSelect
                {...fieldA11y(id("specialty"), errors.specialty)}
                value={field.value}
                onChange={field.onChange}
                options={SPECIALTY_OPTIONS}
              />
            )}
          />
        </FormField>

        <FormField id={id("category")} label="Category" required error={errors.category}>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <OptionSelect
                {...fieldA11y(id("category"), errors.category)}
                value={field.value ?? null}
                onChange={field.onChange}
                options={CATEGORY_OPTIONS}
                placeholder="Select a category"
              />
            )}
          />
        </FormField>

        <FormField id={id("difficulty")} label="Difficulty" required error={errors.difficulty}>
          <Controller
            control={control}
            name="difficulty"
            render={({ field }) => (
              <OptionSelect
                {...fieldA11y(id("difficulty"), errors.difficulty)}
                value={field.value}
                onChange={field.onChange}
                options={DIFFICULTY_OPTIONS}
              />
            )}
          />
        </FormField>
      </div>

      <FormField id={id("description")} label="Description" error={errors.description}>
        <Textarea rows={4} {...fieldA11y(id("description"), errors.description)} {...register("description")} />
      </FormField>

      <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <div className="grid gap-1">
          <Label htmlFor={id("is_active")}>Active</Label>
          <p className="text-muted-foreground text-xs">Only active cases are available to students.</p>
        </div>
        <Controller
          control={control}
          name="is_active"
          render={({ field }) => <Switch id={id("is_active")} checked={field.value} onCheckedChange={field.onChange} />}
        />
      </div>
    </div>
  );
}
