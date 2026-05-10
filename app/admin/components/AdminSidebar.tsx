"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navSections = [
  {
    heading: "Overview",
    links: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/orders", label: "Token orders" },
      { href: "/admin/tasks", label: "All tasks" },
    ],
  },
  {
    heading: "Workstreams",
    links: [
      { href: "/admin/tasks/sponsorship", label: "Sponsorship" },
      { href: "/admin/tasks/auction", label: "Auction" },
      { href: "/admin/tasks/vendors", label: "Vendors" },
      { href: "/admin/tasks/attractions", label: "Attractions" },
      { href: "/admin/tasks/marketing", label: "Marketing" },
      { href: "/admin/tasks/build", label: "Build" },
    ],
  },
  {
    heading: "Registers",
    links: [
      { href: "/admin/vendors", label: "Vendors" },
      { href: "/admin/sponsors", label: "Sponsors" },
      { href: "/admin/auction", label: "Auction items" },
    ],
  },
];

export default function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-forest text-bone flex items-center justify-between px-4 py-3">
        <p className="font-display text-lg leading-tight">Nicho Halloween</p>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          className="w-8 h-8 flex items-center justify-center"
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4L16 16M16 4L4 16" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 5H17M3 10H17M3 15H17" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-ink/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile slide-out nav */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 bg-forest text-bone min-h-screen w-64 py-8 px-5 transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-moss mb-1">
              Admin
            </p>
            <p className="font-display text-2xl leading-tight">
              Nicho Halloween
              <br />
              Festival
            </p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className="w-8 h-8 flex items-center justify-center text-bone"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4L16 16M16 4L4 16" />
            </svg>
          </button>
        </div>

        <NavContent pathname={pathname} onLinkClick={() => setMobileOpen(false)} />

        <div className="pt-6 border-t border-moss/30 mt-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-moss">
            Logged in as
          </p>
          <p className="text-base font-body text-bone mt-0.5">{userName}</p>
        </div>
      </aside>

      {/* Desktop sidebar (unchanged) */}
      <aside className="hidden md:flex flex-col bg-forest text-bone min-h-screen w-60 py-8 px-5 flex-shrink-0">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-moss mb-1">
            Admin
          </p>
          <p className="font-display text-2xl leading-tight">
            Nicho Halloween
            <br />
            Festival
          </p>
        </div>

        <NavContent pathname={pathname} />

        <div className="pt-6 border-t border-moss/30">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-moss">
            Logged in as
          </p>
          <p className="text-base font-body text-bone mt-0.5">{userName}</p>
        </div>
      </aside>
    </>
  );
}

function NavContent({
  pathname,
  onLinkClick,
}: {
  pathname: string;
  onLinkClick?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-6">
      {navSections.map((section) => (
        <div key={section.heading}>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-moss mb-3">
            {section.heading}
          </p>
          <ul className="space-y-1">
            {section.links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onLinkClick}
                    className={`block py-1.5 px-3 text-base font-body transition-colors rounded ${
                      isActive
                        ? "bg-forest-deep text-paper"
                        : "text-bone hover:text-paper hover:bg-forest-deep/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
