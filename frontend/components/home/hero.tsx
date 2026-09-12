import Image from "next/image";

export default function Hero() {
  return (
    <div className="w-full aspect-16/5 flex items-center justify-between mb-20">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold">
          <span className="bg-black text-white box-decoration-clone px-1 leading-relaxed">
            Learn, study <span className="font-normal">and</span> practise clinical skills
          </span>
        </h1>

        <p className="text-xl">
          <span className="bg-black text-white box-decoration-clone px-1 leading-relaxed">
            Browse <span className="font-bold">free OSCE guides</span> and clinical articles, or head to our
            interactive platform to practise with OSCE stations, <span className="font-bold">AI virtual patients</span> and
            question banks
          </span>
        </p>
      </div>

      <Image
        src="/hero.png"
        alt="Hero Image"
        width={1200}
        height={300}
        className="w-auto h-full"
      />
    </div>
  );
}
