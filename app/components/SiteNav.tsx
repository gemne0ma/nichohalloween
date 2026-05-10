"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/attractions", label: "Attractions" },
  { href: "/tokens", label: "Tokens" },
  { href: "/auction", label: "Silent Auction" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/faq", label: "FAQ" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="w-full bg-forest-deep sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between md:justify-center">
        {/* Mobile: site name left */}
        <span className="md:hidden font-display text-lg text-bone tracking-wide">
          Nicho Halloween
        </span>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-mono text-sm uppercase tracking-[0.15em] transition-colors ${
                pathname === link.href
                  ? "text-pumpkin"
                  : "text-paper/80 hover:text-paper"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="font-mono text-sm uppercase tracking-[0.15em] text-rust border border-rust px-3 py-1.5 hover:bg-rust hover:text-paper transition-colors"
          >
            Admin
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden font-mono text-sm uppercase tracking-[0.15em] text-paper"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-forest-deep border-t border-moss/30 px-6 pb-6">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`font-mono text-sm uppercase tracking-[0.15em] py-3 border-b border-dotted border-moss/20 transition-colors ${
                  pathname === link.href
                    ? "text-pumpkin"
                    : "text-paper/80 hover:text-paper"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="font-mono text-sm uppercase tracking-[0.15em] text-rust py-3 hover:text-pumpkin transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
