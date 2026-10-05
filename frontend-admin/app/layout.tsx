import type { Metadata } from "next";
import { Montserrat, Inter } from 'next/font/google'
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClerkProvider } from '@clerk/nextjs'
import SidebarNav from "@/components/sidebar";
import { Toaster } from "sonner";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MedStudent.LK",
  description: "Home of the Sri Lankan Medical Student",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", montserrat.className, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <SidebarNav>
            <Toaster />
            {children}
          </SidebarNav>
        </ClerkProvider>
      </body>
    </html>
  );
}
