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

import { useState } from "react";

const navItems = [
  {
    name: "ABOUT",
    link: "/about",
  },
  {
    name: "SERVICES",
    link: "/services",
  },
  {
    name: "CONTACT",
    link: "/contact",
  },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Navbar>
      {/* Desktop */}
      <NavBody className="px-8 py-6">
        <div className="flex h-10 items-center">
          <div className="text-xl font-bold leading-10">MedStudent.LK</div>
        </div>

        <NavItems items={navItems} />

        <NavbarButton href="/contact">Get Started</NavbarButton>
      </NavBody>

      {/* Mobile */}
      <MobileNav className="px-8 py-6">
        <MobileNavHeader className="h-10">
          <div className="text-xl font-bold leading-10">MedStudent.LK</div>

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
            <a
              key={item.link}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full"
            >
              {item.name}
            </a>
          ))}
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}