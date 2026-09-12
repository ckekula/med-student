import Hero from "@/components/home/hero";
import Header from "@/components/shared/header";

export default function Home() {
  return (
    <div className="w-7xl mx-auto px-8">
      <Header />
      <div className="w-full h-300">
        <Hero />
      </div>
    </div>
  );
}
