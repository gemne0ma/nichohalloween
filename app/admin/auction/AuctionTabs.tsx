"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { AuctionTabCounts } from "./counts";

export type AuctionTabKey = "items" | "outreach" | "tasks";

const TABS: { key: AuctionTabKey; label: string; href: string }[] = [
  { key: "items", label: "Items", href: "/admin/auction" },
  { key: "outreach", label: "Business outreach", href: "/admin/auction/prospects" },
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
      className="flex items-stretch w-full border-b border-ink mb-6"
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
            className={`flex-1 min-w-0 text-center px-2 md:px-5 py-2.5 md:py-3 leading-tight transition-colors focus:outline-none focus-visible:underline ${
              isActive
                ? // Folder tab: bordered left, top and right, no bottom, pulled
                  // down a pixel so it sits on the rule and covers it.
                  "font-display text-base md:text-lg text-ink bg-paper border border-ink border-b-0 -mb-px"
                : "font-body text-sm md:text-base text-ink-soft border border-transparent border-b-0 hover:bg-paper-deep hover:text-ink"
            }`}
          >
            <span className="break-words">{tab.label}</span>
            <span
              className={`font-mono text-[10px] ml-1.5 md:ml-2 align-middle ${
                isActive ? "text-rust-deep" : "text-moss"
              }`}
            >
              {count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
