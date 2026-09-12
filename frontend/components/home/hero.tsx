import Image from "next/image";

export default function Hero() {
  return (
    <div className="w-full h-[31.25%] flex items-center justify-between">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold">
          <span className="bg-black text-white box-decoration-clone px-1 leading-relaxed">
            Learn, study <span className="font-normal">and</span> practise clinical skills
          </span>
        </h1>

        <p className="text-xl">
          <span className="bg-black text-white box-decoration-clone px-1 leading-relaxed">
            Browse free OSCE guides and clinical articles, or head to our
            interactive platform to practise with OSCE stations, AI virtual
            patients and question banks
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