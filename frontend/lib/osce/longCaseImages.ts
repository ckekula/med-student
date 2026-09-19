import type { LongCaseCategory } from "@/types/osce/longCase";

const FALLBACK_IMAGE = "/hero.png";

const CATEGORY_IMAGES: Partial<Record<LongCaseCategory, string>> = {
  Neurological: "/osce/neurological.png",
  Endocrine: "/osce/endocrine.png",
};

export function getLongCaseImage(category: LongCaseCategory): string {
  return CATEGORY_IMAGES[category] ?? FALLBACK_IMAGE;
}
