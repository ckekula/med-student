"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { OptionSelect } from "./option-select";
import { SPECIALTY_OPTIONS, type Option } from "@/lib/osce/longCaseOptions";
import {
  LONG_CASES_PATH,
  buildListHref,
  hasActiveFilters,
  type LongCaseListQuery,
  type StatusFilter,
} from "@/lib/osce/longCaseListQuery";

const STATUS_OPTIONS: readonly Option<StatusFilter>[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

/** Filters live in the URL so the server renders the filtered page and links stay shareable. */
export function LongCaseFilters({ query }: { query: LongCaseListQuery }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = (href: string) => startTransition(() => router.replace(href, { scroll: false }));
  const update = (overrides: Partial<LongCaseListQuery>) => navigate(buildListHref(query, { ...overrides, page: 1 }));

  return (
    <div className="flex flex-wrap items-center gap-3" aria-busy={isPending}>
      <OptionSelect
        aria-label="Filter by specialty"
        className="w-52"
        value={query.specialty ?? null}
        onChange={(specialty) => update({ specialty: specialty ?? undefined })}
        options={SPECIALTY_OPTIONS}
        emptyLabel="All specialties"
      />
      <OptionSelect
        aria-label="Filter by status"
        className="w-40"
        value={query.status}
        onChange={(status) => status && update({ status })}
        options={STATUS_OPTIONS}
      />
      {hasActiveFilters(query) && (
        <Button variant="ghost" size="sm" onClick={() => navigate(LONG_CASES_PATH)}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
