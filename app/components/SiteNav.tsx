"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/attractions", label: "Attractions" },
  { href: "/tokens", label: "Tokens" },
  { href: "/auction", label: "Silent Auction" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/map", label: "Map" },
  { href: "/faq", label: "FAQ" },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="w-full bg-forest-deep/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Site name / logo */}
        <Link
          href="/"
          className="font-display text-xl text-paper tracking-wide hover:text-pumpkin transition-colors"
        >
          Nicho Halloween
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-mono text-xs uppercase tracking-[0.15em] transition-colors ${
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
            className="font-mono text-xs uppercase tracking-[0.15em] text-rust border border-rust px-3 py-1.5 hover:bg-rust hover:text-paper transition-colors"
          >
            Admin
          </Link>
        </div>

        {/* Mobile menu button (placeholder, we will build the drawer later) */}
        <button
          className="md:hidden font-mono text-xs uppercase tracking-[0.15em] text-paper"
          aria-label="Open navigation menu"
        >
          Menu
        </button>
      </div>
    </nav>
  );
}
