"use client";

import { useId, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch, type Control, type FieldErrors } from "react-hook-form";
import { LuLoaderCircle } from "react-icons/lu";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createLongCaseAction, updateLongCaseAction } from "@/lib/actions/osce/longCase";
import { GENERIC_ERROR } from "@/lib/actions/result";
import { createEmptyFormValues } from "@/lib/osce/longCaseMappers";
import { longCaseFormSchema, type LongCaseFormValues } from "@/lib/validations/osce/longCase";
import type { LongCaseDetail } from "@/types/osce/longCase";
import { BasicsSection } from "./basics-section";
import { DifferentialsSection } from "./differentials-section";
import { ExaminationsSection } from "./examinations-section";
import { HistorySection } from "./history-section";
import { InvestigationsSection } from "./investigations-section";
import { PatientSection } from "./patient-section";

export type LongCaseFormMode =
  | { type: "create" }
  | { type: "edit"; longCaseId: string; initialValues: LongCaseFormValues };

interface LongCaseFormDialogProps {
  mode: LongCaseFormMode;
  /** Called when the dialog should be unmounted (cancelled or saved). */
  onClose: () => void;
  onSaved?: (details: LongCaseDetail) => void;
}

type SectionValue = "basics" | "patient" | "history" | "examinations" | "investigations" | "differentials";
type ArrayFieldName = "history_items" | "examinations" | "investigations" | "differential_diagnoses";

interface SectionConfig {
  value: SectionValue;
  label: string;
  /** Top-level form fields shown in this tab, used to flag and jump to tabs with errors. */
  fields: readonly (keyof LongCaseFormValues)[];
  countField?: ArrayFieldName;
}

const SECTIONS: readonly SectionConfig[] = [
  { value: "basics", label: "Basics", fields: ["title", "specialty", "category", "difficulty", "description", "is_active"] },
  { value: "patient", label: "Patient", fields: ["patient_profile"] },
  { value: "history", label: "History", fields: ["history_items"], countField: "history_items" },
  { value: "examinations", label: "Examinations", fields: ["examinations"], countField: "examinations" },
  { value: "investigations", label: "Investigations", fields: ["investigations"], countField: "investigations" },
  { value: "differentials", label: "Differentials", fields: ["differential_diagnoses"], countField: "differential_diagnoses" },
];

/**
 * Mounted only while open, so every open starts from fresh form state.
 * The parent renders it conditionally.
 */
export function LongCaseFormDialog({ mode, onClose, onSaved }: LongCaseFormDialogProps) {
  const formId = useId();
  const [tab, setTab] = useState<SectionValue>("basics");
  const isEdit = mode.type === "edit";

  const form = useForm<LongCaseFormValues>({
    resolver: zodResolver(longCaseFormSchema),
    defaultValues: mode.type === "edit" ? mode.initialValues : createEmptyFormValues(),
  });
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = form;

  const requestClose = () => {
    if (isSubmitting) return;
    if (isDirty && !window.confirm("Discard your unsaved changes?")) return;
    onClose();
  };

  const onValid = async (values: LongCaseFormValues) => {
    try {
      const result =
        mode.type === "edit"
          ? await updateLongCaseAction(mode.longCaseId, values)
          : await createLongCaseAction(values);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(isEdit ? "Long case updated." : "Long case created.");
      onSaved?.(result.data);
      onClose();
    } catch {
      toast.error(GENERIC_ERROR);
    }
  };

  // Errors can live in a tab that isn't visible, so jump to the first one.
  const onInvalid = (fieldErrors: FieldErrors<LongCaseFormValues>) => {
    const firstInvalid = SECTIONS.find((section) => section.fields.some((field) => field in fieldErrors));
    if (firstInvalid) setTab(firstInvalid.value);
    toast.error("Fix the highlighted fields and try again.");
  };

  return (
    <Dialog open onOpenChange={(open) => !open && requestClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-3xl">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{isEdit ? "Edit long case" : "New long case"}</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form
            id={formId}
            noValidate
            onSubmit={handleSubmit(onValid, onInvalid)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <Tabs value={tab} onValueChange={(value) => setTab(value as SectionValue)} className="flex min-h-0 flex-1 flex-col gap-0">
              <div className="overflow-x-auto px-6">
                <TabsList className="w-max">
                  {SECTIONS.map((section) => {
                    const hasError = section.fields.some((field) => errors[field] !== undefined);
                    return (
                      <TabsTrigger key={section.value} value={section.value}>
                        {section.label}
                        {section.countField && <SectionCount control={control} name={section.countField} />}
                        {hasError && (
                          <>
                            <span aria-hidden="true" className="bg-destructive ml-1 size-1.5 rounded-full" />
                            <span className="sr-only">has errors</span>
                          </>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <TabsContent value="basics">
                  <BasicsSection />
                </TabsContent>
                <TabsContent value="patient">
                  <PatientSection />
                </TabsContent>
                <TabsContent value="history">
                  <HistorySection />
                </TabsContent>
                <TabsContent value="examinations">
                  <ExaminationsSection />
                </TabsContent>
                <TabsContent value="investigations">
                  <InvestigationsSection />
                </TabsContent>
                <TabsContent value="differentials">
                  <DifferentialsSection />
                </TabsContent>
              </div>
            </Tabs>
          </form>
        </FormProvider>

        <DialogFooter className="border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={requestClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={isSubmitting}>
            {isSubmitting && <LuLoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
            {isEdit ? (isSubmitting ? "Saving…" : "Save changes") : isSubmitting ? "Creating…" : "Create long case"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Subscribes to one array only, so typing elsewhere doesn't re-render the whole dialog. */
function SectionCount({ control, name }: { control: Control<LongCaseFormValues>; name: ArrayFieldName }) {
  const items = useWatch({ control, name });
  return <span className="text-muted-foreground ml-1 text-xs tabular-nums">({items.length})</span>;
}
