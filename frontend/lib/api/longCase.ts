import type { LongCase } from "@/types/osce/longCase";

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/api/v1/long-cases";

export async function getLongCases(): Promise<LongCase[]> {
  try {
    const res = await fetch(API_URL);

    if (!res.ok) {
      throw new Error(`Failed to fetch long cases: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching long cases:", error);
    return [];
  }
}
