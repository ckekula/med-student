import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { buildListHref, type LongCaseListQuery } from "@/lib/osce/longCaseListQuery";
import { cn } from "@/lib/utils";

interface LongCasePaginationProps {
  query: LongCaseListQuery;
  hasNextPage: boolean;
}

const linkClass = buttonVariants({ variant: "outline", size: "sm" });
const disabledClass = cn(linkClass, "pointer-events-none opacity-50");

export function LongCasePagination({ query, hasNextPage }: LongCasePaginationProps) {
  const hasPreviousPage = query.page > 1;
  if (!hasPreviousPage && !hasNextPage) return null;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between">
      <p className="text-muted-foreground text-sm">Page {query.page}</p>
      <div className="flex gap-2">
        {hasPreviousPage ? (
          <Link href={buildListHref(query, { page: query.page - 1 })} className={linkClass}>
            Previous
          </Link>
        ) : (
          <span aria-disabled="true" className={disabledClass}>
            Previous
          </span>
        )}
        {hasNextPage ? (
          <Link href={buildListHref(query, { page: query.page + 1 })} className={linkClass}>
            Next
          </Link>
        ) : (
          <span aria-disabled="true" className={disabledClass}>
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
