import SidebarDemo from "@/components/sidebar-demo";
import { auth } from "@clerk/nextjs/server";

export default async function HomePage() {
  await auth.protect();

  return (
    <main>
      <div>
        <SidebarDemo />
      </div>
    </main>
  );
}
