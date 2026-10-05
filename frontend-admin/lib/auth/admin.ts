import "server-only";

import { auth } from "@clerk/nextjs/server";
import type { GetToken } from "@/lib/api/client";

/** Clerk organization role that may manage long cases. */
export const ADMIN_ROLE = "org:admin";

export type AdminContext = { ok: true; getToken: GetToken } | { ok: false; error: string };

/**
 * Verifies on the server that the caller is a signed-in organization admin.
 * Every mutating server action must call this: actions are public HTTP endpoints,
 * so hiding buttons in the UI is not access control.
 */
export async function getAdminContext(): Promise<AdminContext> {
  const { userId, has, getToken } = await auth();

  if (!userId) return { ok: false, error: "You need to sign in to do that." };
  if (!has({ role: ADMIN_ROLE })) return { ok: false, error: "Only organization admins can manage long cases." };

  return { ok: true, getToken };
}