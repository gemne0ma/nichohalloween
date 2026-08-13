"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { AuctionTabCounts } from "./counts";

export type AuctionTabKey = "outreach" | "classrooms" | "tasks";

const TABS: { key: AuctionTabKey; label: string; href: string }[] = [
  { key: "outreach", label: "Business outreach", href: "/admin/auction/prospects" },
  { key: "classrooms", label: "Classrooms", href: "/admin/auction/classrooms" },
  { key: "tasks", label: "Tasks", href: "/admin/auction/tasks" },
];

export default function AuctionTabs({
  active,
  counts,
}: {
  active: AuctionTabKey;
  counts: AuctionTabCounts;
}) {
  const activeIndex = TABS.findIndex((t) => t.key === active);
  // Roving tabindex: one tab in the tab order at a time, arrows move focus
  // between them.
  const [focusIndex, setFocusIndex] = useState(activeIndex);
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);

  function focusTab(index: number) {
    const next = (index + TABS.length) % TABS.length;
    setFocusIndex(next);
    refs.current[next]?.focus();
  }

  // Manual activation: arrows move focus, Enter or Space follows the link.
  // Auto-activation would fire a full page navigation on every arrow press.
  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusTab(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusTab(index - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusTab(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusTab(TABS.length - 1);
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Silent auction sections"
      // Wraps to a second line on narrow screens rather than scrolling.
      className="flex flex-wrap items-center gap-2 md:gap-3 mb-6"
    >
      {TABS.map((tab, i) => {
        const isActive = tab.key === active;
        const count = counts[tab.key];

        return (
          <Link
            key={tab.key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            href={tab.href}
            id={`auction-tab-${tab.key}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`auction-panel-${tab.key}`}
            tabIndex={i === focusIndex ? 0 : -1}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onFocus={() => setFocusIndex(i)}
            // Border on both states, so the pill does not resize when it
            // becomes active.
            className={`inline-flex items-baseline rounded-full border border-rust px-4 md:px-5 py-2 leading-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
              isActive
                ? "bg-rust text-bone font-display text-base md:text-lg"
                : "bg-transparent text-rust hover:bg-rust/10 font-body text-sm md:text-base"
            }`}
          >
            <span>{tab.label}</span>
            <span className="ml-2 text-[0.8em] opacity-70 tabular-nums">
              {count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
