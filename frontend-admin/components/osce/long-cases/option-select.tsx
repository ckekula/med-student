"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Option } from "@/lib/osce/longCaseOptions";
import { cn } from "@/lib/utils";

// Radix Select cannot use "" as an item value, so "no selection" gets a sentinel.
const EMPTY_VALUE = "__none__";

interface OptionSelectProps<T extends string> {
  id?: string;
  value: T | null;
  /** Emits `null` only when `emptyLabel` is provided and chosen. */
  onChange: (value: T | null) => void;
  options: readonly Option<T>[];
  placeholder?: string;
  /** Adds a leading "no selection" item (e.g. "All specialties"). */
  emptyLabel?: string;
  className?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export function OptionSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  emptyLabel,
  className,
  id,
  ...aria
}: OptionSelectProps<T>) {
  return (
    <Select
      value={value ?? (emptyLabel ? EMPTY_VALUE : undefined)}
      // Radix reports plain strings; the items rendered below are exactly `options`, so the cast is safe.
      onValueChange={(next) => onChange(next === EMPTY_VALUE ? null : (next as T))}
    >
      <SelectTrigger id={id} className={cn("w-full", className)} {...aria}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {emptyLabel && <SelectItem value={EMPTY_VALUE}>{emptyLabel}</SelectItem>}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
