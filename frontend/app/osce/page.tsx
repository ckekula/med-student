import { cards } from "@/components/osce/cases";
import { LongCaseBrowser } from "@/components/osce/long-case-browser";
import { getLongCases } from "@/lib/api/longCase";

export default async function OSCEPage() {
  const longCases = (await getLongCases());
  // const longCases = cards

  return (
    <div className="w-full flex flex-col items-center justify-center mb-20">
      <h1 className="text-5xl font-bold">
        <span className="bg-black text-white box-decoration-clone px-1 leading-relaxed">
          OSCE Stations
        </span>
      </h1>

      <p className="text-xl">
        <span className="bg-black text-white box-decoration-clone px-1 leading-relaxed">
          Choose a station to practise your clinical skills
        </span>
      </p>

      {longCases.length === 0 ? (
        <p className="text-lg">No active OSCE stations available.</p>
      ): <LongCaseBrowser longCases={longCases} />}
    </div>
  );
}
