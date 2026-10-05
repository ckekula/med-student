import { z } from "zod";
import { LONG_CASE_SPECIALTIES } from "@/lib/osce/longCaseOptions";
import type { LongCaseListParams } from "@/types/osce/longCase";

export const LONG_CASES_PATH = "/long-cases";
export const PAGE_SIZE = 20;

export const STATUS_FILTERS = ["all", "active", "inactive"] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

// Invalid or tampered URL params fall back to defaults instead of throwing.
const listQuerySchema = z.object({
  specialty: z.enum(LONG_CASE_SPECIALTIES).optional().catch(undefined),
  status: z.enum(STATUS_FILTERS).catch("all"),
  page: z.coerce.number().int().min(1).catch(1),
});

export type LongCaseListQuery = z.infer<typeof listQuerySchema>;

type RawSearchParams = Record<string, string | string[] | undefined>;

const firstValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function parseListQuery(raw: RawSearchParams): LongCaseListQuery {
  return listQuerySchema.parse({
    specialty: firstValue(raw.specialty),
    status: firstValue(raw.status),
    page: firstValue(raw.page),
  });
}

/** Requests one extra row so the page can tell whether a next page exists (the API has no total count). */
export function toApiParams(query: LongCaseListQuery): LongCaseListParams {
  const params: LongCaseListParams = {
    skip: (query.page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE + 1,
  };
  if (query.specialty) params.specialty = query.specialty;
  if (query.status !== "all") params.is_active = query.status === "active";
  return params;
}

export function hasActiveFilters(query: LongCaseListQuery): boolean {
  return query.specialty !== undefined || query.status !== "all";
}

export function buildListHref(base: LongCaseListQuery, overrides: Partial<LongCaseListQuery> = {}): string {
  const query = { ...base, ...overrides };
  const params = new URLSearchParams();
  if (query.specialty) params.set("specialty", query.specialty);
  if (query.status !== "all") params.set("status", query.status);
  if (query.page > 1) params.set("page", String(query.page));

  const search = params.toString();
  return search ? `${LONG_CASES_PATH}?${search}` : LONG_CASES_PATH;
}
