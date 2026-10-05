export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });
export const fail = (error: string): ActionResult<never> => ({ ok: false, error });

export const GENERIC_ERROR = "Something went wrong. Please try again.";

/** Error whose message is safe and useful to show to the user as-is. */
export class ActionInputError extends Error {}

export function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : GENERIC_ERROR;
}