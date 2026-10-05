import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreateLongCaseButton } from "@/components/osce/long-cases/create-long-case-button";
import { LongCaseFilters } from "@/components/osce/long-cases/long-case-filters";
import { LongCasePagination } from "@/components/osce/long-cases/long-case-pagination";
import { LongCasesTable } from "@/components/osce/long-cases/long-cases-table";
import { getLongCases } from "@/lib/api/osce/longCase";
import { ADMIN_ROLE } from "@/lib/auth/admin";
import {
  PAGE_SIZE,
  buildListHref,
  hasActiveFilters,
  parseListQuery,
  toApiParams,
} from "@/lib/osce/longCaseListQuery";

interface LongCasesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LongCasesPage({ searchParams }: LongCasesPageProps) {
  await auth.protect({ role: ADMIN_ROLE });

  const query = parseListQuery(await searchParams);
  const fetched = await getLongCases(toApiParams(query));

  // A page past the end (e.g. after deleting the last row of the last page) falls back to the first page.
  if (fetched.length === 0 && query.page > 1) redirect(buildListHref(query, { page: 1 }));

  const longCases = fetched.slice(0, PAGE_SIZE);
  const hasNextPage = fetched.length > PAGE_SIZE;

  return (
    <section className="flex min-h-full w-full flex-col gap-6 rounded-tl-2xl border border-neutral-200 bg-white p-6 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-neutral-500">OSCE</p>
          <h1 className="mt-1 text-3xl font-semibold text-neutral-900 dark:text-white">Long Cases</h1>
        </div>
        <CreateLongCaseButton />
      </div>

      <LongCaseFilters query={query} />

      {longCases.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-sm text-neutral-500 dark:border-neutral-700">
          {hasActiveFilters(query)
            ? "No long cases match these filters."
            : "No long cases have been added yet. Use “New long case” to add the first one."}
        </div>
      ) : (
        <>
          <LongCasesTable longCases={longCases} />
          <LongCasePagination query={query} hasNextPage={hasNextPage} />
        </>
      )}
    </section>
  );
}
