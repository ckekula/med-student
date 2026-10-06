"use client";

import { useId } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { SEX_OPTIONS } from "@/lib/osce/longCaseOptions";
import type { LongCaseFormValues } from "@/lib/validations/osce/longCase";
import { FormField, fieldA11y, toNullableNumber } from "./form-field";
import { OptionSelect } from "./option-select";

export function PatientSection() {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<LongCaseFormValues>();
  const profileErrors = errors.patient_profile;

  return (
    <div className="grid gap-5">
      <p className="text-muted-foreground text-sm">Leave everything blank to save the case without a patient profile.</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id={id("name")} label="Name" error={profileErrors?.name}>
          <Input {...fieldA11y(id("name"), profileErrors?.name)} {...register("patient_profile.name")} />
        </FormField>
        <FormField id={id("age")} label="Age" error={profileErrors?.age}>
          <Input
            type="number"
            min={0}
            max={120}
            step={1}
            inputMode="numeric"
            {...fieldA11y(id("age"), profileErrors?.age)}
            {...register("patient_profile.age", { setValueAs: toNullableNumber })}
          />
        </FormField>
        <FormField id={id("sex")} label="Sex" error={profileErrors?.sex}>
          <Controller
            control={control}
            name="patient_profile.sex"
            render={({ field }) => (
              <OptionSelect
                {...fieldA11y(id("sex"), profileErrors?.sex)}
                value={field.value || null}
                onChange={(value) => field.onChange(value ?? "")}
                options={SEX_OPTIONS}
                placeholder="Select sex"
                emptyLabel="Not specified"
              />
            )}
          />
        </FormField>
        <FormField id={id("marital")} label="Marital status" error={profileErrors?.marital_status}>
          <Input
            {...fieldA11y(id("marital"), profileErrors?.marital_status)}
            {...register("patient_profile.marital_status")}
          />
        </FormField>
        <FormField id={id("occupation")} label="Occupation" error={profileErrors?.occupation}>
          <Input {...fieldA11y(id("occupation"), profileErrors?.occupation)} {...register("patient_profile.occupation")} />
        </FormField>
        <FormField id={id("location")} label="Location" error={profileErrors?.location}>
          <Input {...fieldA11y(id("location"), profileErrors?.location)} {...register("patient_profile.location")} />
        </FormField>
        <FormField id={id("height")} label="Height (cm)" error={profileErrors?.height_cm}>
          <Input
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            {...fieldA11y(id("height"), profileErrors?.height_cm)}
            {...register("patient_profile.height_cm", { setValueAs: toNullableNumber })}
          />
        </FormField>
        <FormField id={id("weight")} label="Weight (kg)" error={profileErrors?.weight_kg}>
          <Input
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            {...fieldA11y(id("weight"), profileErrors?.weight_kg)}
            {...register("patient_profile.weight_kg", { setValueAs: toNullableNumber })}
          />
        </FormField>
      </div>
    </div>
  );
}
