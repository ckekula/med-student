"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createLongCaseWithDetails,
  deleteLongCase,
  getLongCaseDetails,
  updateLongCase,
  updateLongCaseWithDetails,
} from "@/lib/api/osce/longCase";
import type { GetToken } from "@/lib/api/client";
import { getAdminContext } from "@/lib/auth/admin";
import { ActionInputError, errorMessage, fail, ok, type ActionResult } from "@/lib/actions/result";
import { LONG_CASES_PATH } from "@/lib/osce/longCaseListQuery";
import { toWritePayload } from "@/lib/osce/longCaseMappers";
import { longCaseFormSchema } from "@/lib/validations/osce/longCase";
import type { LongCaseDetail } from "@/types/osce/longCase";

const idSchema = z.uuid("Invalid long case id");
const isActiveSchema = z.boolean();

/** Server-side validation: never trust that the client validated. */
function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (result.success) return result.data;

  const issue = result.error.issues[0];
  const field = issue?.path.join(".");
  throw new ActionInputError(issue ? `${field ? `${field}: ` : ""}${issue.message}` : "Invalid input.");
}

/** Runs `run` only for verified admins and converts thrown errors into an `ActionResult`. */
async function withAdmin<T>(run: (getToken: GetToken) => Promise<T>): Promise<ActionResult<T>> {
  const admin = await getAdminContext();
  if (!admin.ok) return fail(admin.error);

  try {
    return ok(await run(admin.getToken));
  } catch (error) {
    if (!(error instanceof ActionInputError)) console.error("[long-case action]", error);
    return fail(errorMessage(error));
  }
}

export async function getLongCaseDetailsAction(longCaseId: string): Promise<ActionResult<LongCaseDetail>> {
  return withAdmin(async (getToken) => {
    const id = parse(idSchema, longCaseId);
    const details = await getLongCaseDetails(getToken, id);
    if (!details) throw new ActionInputError("This long case no longer exists.");
    return details;
  });
}

export async function createLongCaseAction(input: unknown): Promise<ActionResult<LongCaseDetail>> {
  return withAdmin(async (getToken) => {
    const values = parse(longCaseFormSchema, input);
    const created = await createLongCaseWithDetails(getToken, toWritePayload(values));
    revalidatePath(LONG_CASES_PATH);
    return created;
  });
}

export async function updateLongCaseAction(longCaseId: string, input: unknown): Promise<ActionResult<LongCaseDetail>> {
  return withAdmin(async (getToken) => {
    const id = parse(idSchema, longCaseId);
    const values = parse(longCaseFormSchema, input);
    const updated = await updateLongCaseWithDetails(getToken, id, toWritePayload(values));
    revalidatePath(LONG_CASES_PATH);
    return updated;
  });
}

export async function setLongCaseActiveAction(longCaseId: string, isActive: boolean): Promise<ActionResult<null>> {
  return withAdmin(async (getToken) => {
    const id = parse(idSchema, longCaseId);
    await updateLongCase(getToken, id, { is_active: parse(isActiveSchema, isActive) });
    revalidatePath(LONG_CASES_PATH);
    return null;
  });
}

export async function deleteLongCaseAction(longCaseId: string): Promise<ActionResult<null>> {
  return withAdmin(async (getToken) => {
    const id = parse(idSchema, longCaseId);
    await deleteLongCase(getToken, id);
    revalidatePath(LONG_CASES_PATH);
    return null;
  });
}
