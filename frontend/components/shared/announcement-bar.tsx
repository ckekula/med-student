import { StickyBanner } from "@/components/ui/sticky-banner";

export default function AnnouncementBar() {
  return (
    <div className="flex flex-col overflow-y-auto">
      <StickyBanner className="bg-black">
        <p className="mx-0 max-w-[90%] text-white drop-shadow-md">
          Get <span className="font-bold">30% off</span> for first 50 users! Full Access for an entire year.{" "}
          <a href="pricing" className="transition duration-200 underline hover:text-white/80">
            See pricing
          </a>
        </p>
      </StickyBanner>
    </div>
  );
}
