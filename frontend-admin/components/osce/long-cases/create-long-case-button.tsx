"use client";

import { useState } from "react";
import { LuPlus } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { LongCaseFormDialog } from "./long-case-form-dialog";

export function CreateLongCaseButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <LuPlus aria-hidden="true" className="size-4" />
        New long case
      </Button>
      {open && <LongCaseFormDialog mode={{ type: "create" }} onClose={() => setOpen(false)} />}
    </>
  );
}
