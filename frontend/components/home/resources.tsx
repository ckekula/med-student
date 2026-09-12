import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import Image from "next/image";

export default function Resources() {
  const resources = [
    {
      title: "OSCE Stations",
      subtitle: "1300+ interactive scenarios",
      image: "/hero.png",
    },
    {
      title: "Question Bank",
      subtitle: "50,000+ free MCQs",
      image: "/hero.png",
    },
    {
      title: "Virtual Patients",
      subtitle: "AI-powered consultations and examiners",
      image: "/hero.png",
    },
    {
      title: "Notes",
      subtitle: "100+ summary notes",
      image: "/hero.png",
    },
  ];

  return (
    <div className="mb-20">
      <div className="mb-12 text-center text-2xl">
        Explore our <span className="font-bold">Resources</span>
      </div>

      <BentoGrid>
        {resources.map((resource, index) => (
          <BentoGridItem
            key={resource.title}
            title={resource.title}
            description={resource.subtitle}
            className={`cursor-pointer ${index === 0 || index === 3 ? "md:col-span-2" : ""}`}
            header={
              <div className="h-48 w-full overflow-hidden rounded-xl">
                <Image
                width={100}
                height={100}
                  src={resource.image}
                  alt={resource.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover/bento:scale-105"
                />
              </div>
            }
          />
        ))}
      </BentoGrid>
    </div>
  );
}
