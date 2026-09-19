import { notFound } from "next/navigation";
import { OSCEStepper } from "@/components/osce/station/osce-stepper";
import { getLongCaseById } from "@/lib/api/longCase";

interface OSCEStationPageProps {
  params: Promise<{ id: string }>;
}

export default async function OSCEStationPage({
  params,
}: OSCEStationPageProps) {
  const { id } = await params;
  // const longCase = await getLongCaseById(id);
  const longCase = {
    id: "1",
    title: "Abdominal Pain",
    specialty: "Medicine",
    category: "Gastroenterology",
    difficulty: "Final MBBS",
    description: "A patient presents with abdominal pain.",
    is_active: true,
  }

  if (!longCase || !longCase.is_active) {
    notFound();
  }

  return (
    <div className="w-full flex flex-col items-center justify-center mb-20">
      <div className="text-3xl mb-6">
        <span className="font-bold">{longCase.specialty} Long Case - </span>
        {longCase.title}
      </div>

      <p className="text-xl">
        Introduce yourself to the patient to start the timer.
      </p>

      <OSCEStepper />
    </div>
  );
}
