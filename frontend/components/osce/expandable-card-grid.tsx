"use client";

import { useId } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { useExpandedCard } from "@/hooks/use-expandable-card";
import { getLongCaseImage } from "@/lib/osce/longCaseImages";
import type { LongCase } from "@/types/osce/longCase";
import { ExpandedCardModal, getLayoutId } from "./expandable-card-modal";

interface ExpandableCardGridProps {
  longCases: readonly LongCase[];
}

export default function ExpandableCardGrid({
  longCases,
}: ExpandableCardGridProps) {
  const scope = useId();
  const { active, setActive, close, ref } = useExpandedCard<LongCase>();

  return (
    <>
      <ExpandedCardModal
        longCase={active}
        scope={scope}
        modalRef={ref}
        onClose={close}
      />

      <ul className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start gap-4">
        {longCases.map((longCase) => (
          <motion.li
            key={longCase.id}
            layoutId={getLayoutId("card", longCase.id, scope)}
            onClick={() => setActive(longCase)}
            className="p-4 flex flex-col hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer border"
          >
            <div className="flex gap-4 flex-col w-full">
              <motion.div layoutId={getLayoutId("image", longCase.id, scope)}>
                <Image
                  width={100}
                  height={100}
                  src={getLongCaseImage(longCase.category)}
                  alt={longCase.title}
                  className="h-60 w-full rounded-lg object-cover object-top"
                />
              </motion.div>
              <div className="flex justify-center items-center flex-col">
                <motion.h3
                  layoutId={getLayoutId("title", longCase.id, scope)}
                  className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left text-base"
                >
                  {longCase.title}
                </motion.h3>
                <motion.p
                  layoutId={getLayoutId("specialty", longCase.id, scope)}
                  className="text-neutral-600 dark:text-neutral-400 text-center md:text-left text-base"
                >
                  {longCase.specialty}
                </motion.p>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </>
  );
}