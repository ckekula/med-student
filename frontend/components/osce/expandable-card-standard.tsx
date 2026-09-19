"use client";

import { useId } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { useExpandedCard } from "@/hooks/use-expandable-card";
import { getLongCaseImage } from "@/lib/osce/longCaseImages";
import type { LongCase } from "@/types/osce/longCase";
import { ExpandedCardModal, getLayoutId } from "./expandable-card-modal";

interface ExpandableCardStandardProps {
  longCases: readonly LongCase[];
}

export default function ExpandableCardStandard({
  longCases,
}: ExpandableCardStandardProps) {
  const scope = useId();
  const { active, setActive, close, ref } = useExpandedCard<LongCase>();

  return (
    <>
      <ExpandedCardModal
        longCase={active}
        scope={scope}
        modalRef={ref}
        onClose={close}
        sharedCta
      />

      <ul className="w-full flex flex-col gap-4">
        {longCases.map((longCase) => (
          <motion.li
            key={longCase.id}
            layoutId={getLayoutId("card", longCase.id, scope)}
            onClick={() => setActive(longCase)}
            className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer border"
          >
            <div className="flex gap-4 flex-col md:flex-row">
              <motion.div layoutId={getLayoutId("image", longCase.id, scope)}>
                <Image
                  width={100}
                  height={100}
                  src={getLongCaseImage(longCase.category)}
                  alt={longCase.title}
                  className="h-40 w-40 md:h-14 md:w-14 rounded-lg object-cover object-top"
                />
              </motion.div>
              <div>
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
            {/* Decorative: the row click opens the modal, which holds the real link. */}
            <motion.button
              type="button"
              layoutId={getLayoutId("button", longCase.id, scope)}
              className="px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-green-500 hover:text-white text-black mt-4 md:mt-0"
            >
              Start
            </motion.button>
          </motion.li>
        ))}
      </ul>
    </>
  );
}