"use client";

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import Link from "next/link";

import { useState } from "react";

const navItems = [
  {
    name: "OSCE",
    link: "/osce",
  },
  {
    name: "NOTES",
    link: "/notes",
  },
  {
    name: "SHOP",
    link: "/shop",
  },
  {
    name: "BLOG",
    link: "/blog",
  },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Navbar className="mb-20">
      {/* Desktop */}
      <NavBody className="px-8 py-6">
        <Link href="/" className="z-100 flex h-10 items-center cursor-pointer">
          <div className="text-xl font-bold">
            MedStudent<span className="font-normal">.LK</span>
          </div>
        </Link>

        <NavItems items={navItems} />

        <div className="flex items-center gap-3">
          <NavbarButton variant="accent" href="/signup">
            Get Started
          </NavbarButton>
        </div>
      </NavBody>

      {/* Mobile */}
      <MobileNav className="px-8 py-6">
        <MobileNavHeader className="h-10">
          <Link href="/" className="z-100 text-xl font-bold">
            MedStudent<span className="font-normal">.LK</span>
          </Link>

          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item) => (
            <Link
              key={item.link}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full"
            >
              {item.name}
            </Link>
          ))}
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
