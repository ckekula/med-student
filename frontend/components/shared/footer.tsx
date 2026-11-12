import Link from "next/link";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

const footerLinks = [
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
  { title: "Blog", href: "/blog" },
  { title: "Pricing", href: "/pricing" },
];

export default function Footer() {
  return (
    <footer className="border-t-2">
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
              <FaInstagram />
            </Link>

            <Link
              href="#"
              aria-label="Facebook"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <FaFacebook />
            </Link>

            <Link
              href="#"
              aria-label="YouTube"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <FaYoutube />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
