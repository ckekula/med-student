"use client";

import { useState } from "react";
import ExpandableCardGrid from "@/components/osce/expandable-card-grid";
import ExpandableCardStandard from "@/components/osce/expandable-card-standard";
import { LuGrid2X2, LuList } from "react-icons/lu";

export default function OSCEPage() {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="w-full flex flex-col items-center justify-center mb-20">
      <h1 className="text-5xl font-bold">
        <span className="bg-black text-white box-decoration-clone px-1 leading-relaxed">
          OSCE Stations
        </span>
      </h1>

      <p className="text-xl">
        <span className="bg-black text-white box-decoration-clone px-1 leading-relaxed">
          Choose a station to practise your clinical skills
        </span>
      </p>

      {/* View switcher */}
      <div className="w-full flex justify-end px-6 mt-6">
        <div className="flex items-center gap-1 border border-gray-300 rounded-md p-1">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`p-2 rounded ${
              view === "grid"
                ? "bg-black text-white"
                : "text-gray-500 hover:bg-gray-100 cursor-pointer"
            }`}
            aria-label="Grid view"
          >
            <LuGrid2X2 size={20} />
          </button>

          <button
            type="button"
            onClick={() => setView("list")}
            className={`p-2 rounded ${
              view === "list"
                ? "bg-black text-white"
                : "text-gray-500 hover:bg-gray-100 cursor-pointer"
            }`}
            aria-label="List view"
          >
            <LuList size={20} />
          </button>
        </div>
      </div>

      {/* Selected view */}
      <div className="w-full mt-6">
        {view === "grid" ? (
          <ExpandableCardGrid />
        ) : (
          <ExpandableCardStandard />
        )}
      </div>
    </div>
  );
}