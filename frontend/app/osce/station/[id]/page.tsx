import { OSCEStepper } from "@/components/osce/station/osce-stepper";

export default function OSCEStationpage() {
  return (
    <div className="w-full flex flex-col items-center justify-center mb-20">
      <div className="text-3xl mb-6">
        <span className="font-bold">Medicine Long Case - </span>Breast Lump
      </div>

      <p className="text-xl">
        Introduce yourself to the patient to start the timer.
      </p>

      <OSCEStepper />
    </div>
  )
}
