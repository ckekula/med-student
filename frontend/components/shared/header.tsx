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
import {
  Show,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
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
  // {
  //   name: "FAQ",
  //   link: "/faq",
  // },
  // {
  //   name: "LOGIN",
  //   link: "/login",
  // }
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Navbar className="mb-20">
      {/* Desktop */}
      <NavBody className="px-8 py-6">
        <Link href="/" className="flex h-10 items-center">
          <div className="text-xl font-bold">MedStudent<span className="font-normal">.LK</span></div>
        </Link>

        <NavItems items={navItems} />

        <Show when="signed-out">
          <div className="flex items-center gap-3">
            <SignUpButton mode="modal">
              <NavbarButton variant="accent">
                Get Started
              </NavbarButton>
            </SignUpButton>
          </div>
        </Show>

        <Show when="signed-in">
          <UserButton />
        </Show>
      </NavBody>

      {/* Mobile */}
      <MobileNav className="px-8 py-6">
        <MobileNavHeader className="h-10">
          <div className="text-xl font-bold">MedStudent<span className="font-normal">.LK</span></div>

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