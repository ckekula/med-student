import type { ReactNode } from "react";
import type { FieldError } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  error?: FieldError;
  description?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/** Label + control + validation message with the ARIA wiring done once. */
export function FormField({ id, label, error, description, required, className, children }: FormFieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        )}
      </Label>
      {children}
      {error?.message ? (
        <p id={`${id}-error`} role="alert" className="text-destructive text-xs">
          {error.message}
        </p>
      ) : description ? (
        <p className="text-muted-foreground text-xs">{description}</p>
      ) : null}
    </div>
  );
}

/** Spread onto the control so it is linked to its label and error message. */
export function fieldA11y(id: string, error?: FieldError) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  } as const;
}

/** `setValueAs` for optional number inputs: empty string means "no value". */
export function toNullableNumber(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
