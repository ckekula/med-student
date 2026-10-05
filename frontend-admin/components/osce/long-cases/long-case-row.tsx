"use client";

import { useId, useOptimistic, useState, useTransition } from "react";
import { LuChevronRight, LuLoaderCircle, LuPencil, LuTrash2 } from "react-icons/lu";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import { getLongCaseDetailsAction, setLongCaseActiveAction } from "@/lib/actions/osce/longCase";
import { GENERIC_ERROR, fail, type ActionResult } from "@/lib/actions/result";
import { CATEGORY_LABELS, DIFFICULTY_LABELS, SPECIALTY_LABELS } from "@/lib/osce/longCaseOptions";
import { toFormValues } from "@/lib/osce/longCaseMappers";
import type { LongCaseFormValues } from "@/lib/validations/osce/longCase";
import { cn } from "@/lib/utils";
import type { LongCase, LongCaseDetail } from "@/types/osce/longCase";
import { DeleteLongCaseDialog } from "./delete-long-case-dialog";
import { LongCaseDetails } from "./long-case-details";
import { LongCaseFormDialog } from "./long-case-form-dialog";

export const LONG_CASE_TABLE_COLUMNS = 6;

const dateFormatter = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" });

/** Formats the calendar date of an ISO timestamp identically on server and client (no hydration mismatch). */
function formatDate(iso: string): string {
  return dateFormatter.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
}

type DetailsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: LongCaseDetail };

async function fetchDetails(longCaseId: string): Promise<ActionResult<LongCaseDetail>> {
  try {
    return await getLongCaseDetailsAction(longCaseId);
  } catch {
    return fail(GENERIC_ERROR);
  }
}

export function LongCaseRow({ longCase }: { longCase: LongCase }) {
  const panelId = useId();
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState<DetailsState>({ status: "idle" });
  const [editValues, setEditValues] = useState<LongCaseFormValues | null>(null);
  const [isPreparingEdit, setIsPreparingEdit] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isTogglePending, startToggle] = useTransition();
  const [isActive, setOptimisticActive] = useOptimistic(longCase.is_active);

  const loadDetails = async () => {
    setDetails({ status: "loading" });
    const result = await fetchDetails(longCase.id);
    setDetails(result.ok ? { status: "ready", data: result.data } : { status: "error", message: result.error });
  };

  const handleToggleExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && (details.status === "idle" || details.status === "error")) void loadDetails();
  };

  // Always fetch fresh data for editing: saving syncs children by id, so a stale form could delete newer rows.
  const handleEdit = async () => {
    setIsPreparingEdit(true);
    const result = await fetchDetails(longCase.id);
    setIsPreparingEdit(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setDetails({ status: "ready", data: result.data });
    setEditValues(toFormValues(result.data));
  };

  const handleActiveChange = (checked: boolean) => {
    startToggle(async () => {
      setOptimisticActive(checked);
      try {
        const result = await setLongCaseActiveAction(longCase.id, checked);
        if (!result.ok) toast.error(result.error);
      } catch {
        toast.error(GENERIC_ERROR);
      }
    });
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex items-start gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 size-8 shrink-0"
              aria-expanded={expanded}
              aria-controls={panelId}
              aria-label={`${expanded ? "Hide" : "Show"} details for ${longCase.title}`}
              onClick={handleToggleExpanded}
            >
              <LuChevronRight
                aria-hidden="true"
                className={cn("size-4 transition-transform motion-reduce:transition-none", expanded && "rotate-90")}
              />
            </Button>
            <div className="min-w-0">
              <div className="font-medium">{longCase.title}</div>
              <div className="text-muted-foreground text-xs">
                {CATEGORY_LABELS[longCase.category]}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline">{SPECIALTY_LABELS[longCase.specialty]}</Badge>
        </TableCell>
        <TableCell>{DIFFICULTY_LABELS[longCase.difficulty]}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onCheckedChange={handleActiveChange}
              disabled={isTogglePending}
              aria-label={`${isActive ? "Deactivate" : "Activate"} ${longCase.title}`}
            />
            <span className="text-sm">{isActive ? "Active" : "Inactive"}</span>
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(longCase.updated_at)}</TableCell>
        <TableCell>
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Edit ${longCase.title}`}
              onClick={handleEdit}
              disabled={isPreparingEdit}
            >
              {isPreparingEdit ? (
                <LuLoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <LuPencil aria-hidden="true" className="size-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" aria-label={`Delete ${longCase.title}`} onClick={() => setDeleteOpen(true)}>
              <LuTrash2 aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableCell id={panelId} colSpan={LONG_CASE_TABLE_COLUMNS} className="px-6 py-6 whitespace-normal">
            <DetailsPanel state={details} onRetry={loadDetails} />
          </TableCell>
        </TableRow>
      )}

      {editValues && (
        <LongCaseFormDialog
          mode={{ type: "edit", longCaseId: longCase.id, initialValues: editValues }}
          onClose={() => setEditValues(null)}
          onSaved={(data) => setDetails({ status: "ready", data })}
        />
      )}

      <DeleteLongCaseDialog
        longCaseId={longCase.id}
        title={longCase.title}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}

function DetailsPanel({ state, onRetry }: { state: DetailsState; onRetry: () => void }) {
  if (state.status === "ready") return <LongCaseDetails details={state.data} />;

  if (state.status === "error") {
    return (
      <div className="flex items-center gap-3 text-sm">
        <p className="text-destructive">{state.message}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-3" role="status" aria-label="Loading details">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-3/5" />
    </div>
  );
}
