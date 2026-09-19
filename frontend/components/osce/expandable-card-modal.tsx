"use client";

import type { RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { LongCase } from "@/types/osce/longCase";
import { getLongCaseImage } from "@/lib/osce/longCaseImages";

type LayoutPart = "card" | "image" | "title" | "specialty" | "button";

/** Builds a unique layoutId. Always keyed on the case's id, never on its text. */
export const getLayoutId = (part: LayoutPart, caseId: string, scope: string) =>
  `${part}-${caseId}-${scope}`;

const MotionLink = motion.create(Link);

interface ExpandedCardModalProps {
  longCase: LongCase | null;
  /** Value from useId(), shared with the list so layout IDs match. */
  scope: string;
  modalRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  /** Animate the CTA between list and modal (list view has a matching button). */
  sharedCta?: boolean;
}

export function ExpandedCardModal({
  longCase,
  scope,
  modalRef,
  onClose,
  sharedCta = false,
}: ExpandedCardModalProps) {
  const ctaMotionProps = longCase
    ? sharedCta
      ? { layoutId: getLayoutId("button", longCase.id, scope) }
      : {
          layout: true,
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        }
    : {};

  return (
    <>
      <AnimatePresence>
        {longCase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {longCase && (
          <div className="fixed inset-0 grid place-items-center z-100">
            <motion.button
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={onClose}
              aria-label="Close"
            >
              <CloseIcon />
            </motion.button>

            <motion.div
              layoutId={getLayoutId("card", longCase.id, scope)}
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-label={longCase.title}
              className="w-full max-w-125 h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={getLayoutId("image", longCase.id, scope)}>
                <Image
                  width={200}
                  height={200}
                  src={getLongCaseImage(longCase.category)}
                  alt={longCase.title}
                  className="w-full h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                />
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div>
                    <motion.h3
                      layoutId={getLayoutId("title", longCase.id, scope)}
                      className="font-medium text-neutral-700 dark:text-neutral-200 text-base"
                    >
                      {longCase.title}
                    </motion.h3>
                    <motion.p
                      layoutId={getLayoutId("specialty", longCase.id, scope)}
                      className="text-neutral-600 dark:text-neutral-400 text-base"
                    >
                      {longCase.specialty}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-1 text-sm capitalize text-neutral-500 dark:text-neutral-500"
                    >
                      {longCase.difficulty}
                    </motion.p>
                  </div>

                  <MotionLink
                    {...ctaMotionProps}
                    href={`/osce/station/${encodeURIComponent(longCase.id)}`}
                    className="px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white"
                  >
                    Start
                  </MotionLink>
                </div>

                <div className="pt-4 relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] scrollbar-none [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {longCase.description} Please take a focused history, perform an appropriate examination, and be ready to discuss the case afterwards.
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export function CloseIcon() {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
      aria-hidden="true"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
}
