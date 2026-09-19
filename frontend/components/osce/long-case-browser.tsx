"use client";

import { useState } from "react";
import { LuGrid2X2, LuList } from "react-icons/lu";
import type { LongCase } from "@/types/osce/longCase";
import ExpandableCardGrid from "./expandable-card-grid";
import ExpandableCardStandard from "./expandable-card-standard";

type View = "grid" | "list";

const VIEW_OPTIONS = [
  { value: "grid", label: "Grid view", Icon: LuGrid2X2 },
  { value: "list", label: "List view", Icon: LuList },
] as const satisfies readonly {
  value: View;
  label: string;
  Icon: typeof LuGrid2X2;
}[];

interface LongCaseBrowserProps {
  longCases: readonly LongCase[];
}

export function LongCaseBrowser({ longCases }: LongCaseBrowserProps) {
  const [view, setView] = useState<View>("grid");

  return (
    <>
      <div className="w-full flex justify-end px-6 mt-6">
        <div className="flex items-center gap-1 border border-gray-300 rounded-md p-1">
          {VIEW_OPTIONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setView(value)}
              aria-label={label}
              aria-pressed={view === value}
              className={`p-2 rounded ${
                view === value
                  ? "bg-black text-white"
                  : "text-gray-500 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              <Icon size={20} />
            </button>
          ))}
        </div>
      </div>

      <div className="w-full mt-6">
        {view === "grid" ? (
          <ExpandableCardGrid longCases={longCases} />
        ) : (
          <ExpandableCardStandard longCases={longCases} />
        )}
      </div>
    </>
  );
}