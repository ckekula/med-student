import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { OSCEStepper } from "@/components/osce/station/osce-stepper";
import { getLongCaseById } from "@/lib/api/longCase";
import { createAttempt } from "@/lib/api/longCaseAttempt";
import { SignupModal } from "@/components/auth/signup-modal";
import { AttemptStatus } from "@/types/osce/longCaseAttempt";
import { toChatMessage } from "@/types/osce/historyChat";

interface OSCEStationPageProps {
  params: Promise<{ id: string }>;
}

const CHAT_STATUSES: readonly AttemptStatus[] = ["started", "in_progress_history"]

export default async function OSCEStationPage({
  params,
}: OSCEStationPageProps) {
  const { id } = await params;
  const { userId, getToken } = await auth();
  const longCase = await getLongCaseById(id);
  const attempt = userId ? await createAttempt(getToken, { long_case_id: id }) : null
  const isReadOnly = attempt !== null && !CHAT_STATUSES.includes(attempt.status)

  if (!longCase || !longCase.is_active) {
    notFound();
  }

  if (userId) {
    await createAttempt(getToken, { long_case_id: id });
  }

  const specialty = longCase.specialty;
  const specialtyFormatted = specialty.charAt(0).toUpperCase() + specialty.slice(1).toLowerCase();

  return (
    <div className="w-full flex flex-col items-center justify-center mb-20">
      {!userId && <SignupModal />}

      <div className="text-3xl mb-6">
        <span className="font-bold">
          {specialtyFormatted} Long Case -{" "}
        </span>
        {longCase.title}
      </div>

      <p className="text-xl">
        Introduce yourself to the patient to start the timer.
      </p>

      <OSCEStepper
        attemptId={attempt?.id ?? null}
        initialMessages={attempt?.messages.map(toChatMessage) ?? []}
        isReadOnly={isReadOnly}
      />

    </div>
  );
}
