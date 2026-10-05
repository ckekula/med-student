"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteLongCaseAction } from "@/lib/actions/osce/longCase";
import { GENERIC_ERROR } from "@/lib/actions/result";

interface DeleteLongCaseDialogProps {
  longCaseId: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteLongCaseDialog({ longCaseId, title, open, onOpenChange }: DeleteLongCaseDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteLongCaseAction(longCaseId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Long case deleted.");
      onOpenChange(false);
    } catch {
      toast.error(GENERIC_ERROR);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isDeleting && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this long case?</AlertDialogTitle>
          <AlertDialogDescription>
            “{title}” and all of its details will be permanently deleted. This can’t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          {/* A plain Button, not AlertDialogAction, so the dialog stays open until the request settles. */}
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting…" : "Delete long case"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
