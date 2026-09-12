import Link from "next/link";

const footerLinks = [
  { title: "OSCE Stations", href: "/osce-stations" },
  { title: "Question Bank", href: "/question-bank" },
  { title: "Virtual Patients", href: "/virtual-patients" },
  { title: "Notes", href: "/notes" },
];

export default function Footer() {
  return (
    <footer className="border-t bg-background shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            MedStudent<span className="font-normal">.LK</span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-4">
          {footerLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.title}
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-12 border-t" />

        {/* Bottom section */}
        <div className="mt-8 flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MedStudent.LK. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <Link
              href="#"
              aria-label="Instagram"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Instagram
            </Link>

            <Link
              href="#"
              aria-label="Facebook"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Facebook
            </Link>

            <Link
              href="#"
              aria-label="LinkedIn"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              LinkedIn
            </Link>

            <Link
              href="#"
              aria-label="YouTube"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              YouTube
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
