import type { LongCaseCategory } from "@/types/osce/longCase";

const FALLBACK_IMAGE = "/hero.png";

const CATEGORY_IMAGES: Partial<Record<LongCaseCategory, string>> = {
  neurological_disorders: "/osce/neurological.png",
};

export function getLongCaseImage(category: LongCaseCategory): string {
  return CATEGORY_IMAGES[category] ?? FALLBACK_IMAGE;
}
