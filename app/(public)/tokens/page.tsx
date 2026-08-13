"use client";

import { useState } from "react";
import Image from "next/image";
import { BUNDLES, formatCents, type BundleType } from "@/lib/bundles";

// Artwork is decorative only. Every price, count and label on this page comes
// from BUNDLES. Nothing here reads a number off an image.
//
// All four files are exactly 655x300, verified on disk. Passing the true size
// to next/image reserves the right space so the card does not jump as the
// image loads. If the artwork is ever re-exported at another size, change
// these two numbers to match, or the reserved space will be wrong.
const ART_WIDTH = 655;
const ART_HEIGHT = 300;

// Describes what is in each picture, for the alt text. Keyed by token count
// so it stays in step with BUNDLES rather than duplicating it.
const ARTWORK_DESCRIPTION: Record<number, string> = {
  25: "A ghost in an orange beanie beside a lantern and a small pumpkin, next to a weathered paper sign",
  50: "A ghost in a brown felt hat beside a lantern and a pumpkin, next to a weathered paper sign",
  100: "A ghost in a pink bowler hat beside a lantern and two pumpkins, next to a weathered paper sign",
  200: "A ghost in an orange hat beside a lantern and a pumpkin, next to a weathered paper sign",
};

export default function TokensPage() {
  const bundleEntries = Object.entries(BUNDLES) as [BundleType, (typeof BUNDLES)[BundleType]][];
  const [loading, setLoading] = useState<BundleType | null>(null);

  async function handleBuy(bundleType: BundleType) {
    setLoading(bundleType);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundleType }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        alert("Something went wrong. Please try again.");
        setLoading(null);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  return (
    <main className="relative min-h-screen bg-paper overflow-hidden">
      <style>{`
        @keyframes ticketSlide {
          0%   { opacity: 0; transform: translateY(18px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .ticket-slide {
          animation: ticketSlide 0.5s cubic-bezier(0.25, 1, 0.5, 1) both;
        }
        .ticket-slide-0 { animation-delay: 0.10s; }
        .ticket-slide-1 { animation-delay: 0.22s; }
        .ticket-slide-2 { animation-delay: 0.34s; }
        .ticket-slide-3 { animation-delay: 0.46s; }
      `}</style>

      <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
        {/* Intro: polaroid left, copy right */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center mb-14 md:mb-16">
          <div className="md:w-2/5 flex-shrink-0 flex justify-center">
            <div className="-rotate-2 bg-bone p-4 pb-14 shadow-[3px_5px_16px_rgba(26,26,26,0.18),1px_2px_4px_rgba(26,26,26,0.1)] max-w-[420px]">
              <img src="/payup.png" alt="Ghost in sunglasses" className="w-full" />
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-moss text-center mt-3">
                Be there or be square!
              </p>
            </div>
          </div>

          <div className="md:w-3/5">
            <p className="font-mono text-base uppercase tracking-widest text-rust-deep mb-2">
              Get your tokens
            </p>
            <h1 className="font-display font-bold text-6xl md:text-7xl text-ink mb-4">
              Token Bundles
            </h1>
            <p className="font-body text-xl text-ink-soft max-w-2xl">
              Tokens are how you pay for everything at the festival. Pre-purchase
              online and save 15% off the festival-day price.
            </p>
          </div>
        </div>

        {/* Bundle cards: artwork on top, purchase panel underneath */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {bundleEntries.map(([bundleType, bundle], i) => (
            <article
              key={bundleType}
              className={`ticket-slide ticket-slide-${i} bg-bone border border-ink overflow-hidden shadow-[0_2px_12px_rgba(26,26,26,0.12),0_1px_3px_rgba(26,26,26,0.08)] hover:shadow-[0_4px_20px_rgba(26,26,26,0.18),0_2px_6px_rgba(26,26,26,0.1)] transition-all hover:-translate-y-1 flex flex-col`}
            >
              {/* Artwork. Explicit width and height so the space is reserved
                  before it loads and the card does not jump. */}
              <Image
                src={`/images/tokens/tokens-${bundle.tokens}.webp`}
                alt={`${ARTWORK_DESCRIPTION[bundle.tokens] ?? "Festival artwork"}. ${bundle.tokens} token bundle.`}
                width={ART_WIDTH}
                height={ART_HEIGHT}
                className="w-full h-auto"
                priority={i < 2}
              />

              {/* Purchase panel. Everything below comes from BUNDLES. */}
              <div className="p-6 border-t border-ink flex flex-col flex-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-rust-deep mb-2">
                  {bundle.label}
                </p>

                <div className="flex items-baseline gap-3 flex-wrap mb-1">
                  <p className="font-display font-bold text-4xl text-ink leading-none tabular-nums">
                    {formatCents(bundle.prePurchaseCents)}
                  </p>
                  <s className="font-mono text-sm text-moss tabular-nums">
                    {formatCents(bundle.atFestivalCents)}
                  </s>
                </div>

                <p className="font-body text-sm italic text-moss mb-5">
                  {formatCents(bundle.atFestivalCents)} at the festival, so you
                  save {formatCents(bundle.atFestivalCents - bundle.prePurchaseCents)}.
                </p>

                <button
                  onClick={() => handleBuy(bundleType)}
                  disabled={loading !== null}
                  aria-label={`Buy the ${bundle.label} bundle for ${formatCents(bundle.prePurchaseCents)}`}
                  className="mt-auto w-full bg-forest-deep text-bone font-mono text-xs uppercase tracking-[0.3em] py-4 hover:bg-rust transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === bundleType ? "Redirecting..." : "Buy now"}
                </button>
              </div>
            </article>
          ))}
        </div>

        <p className="font-body text-sm italic text-moss text-center mt-10">
          Pre-purchase closes at midnight the day before the festival. Bring your
          confirmation email to the Token Booth on the day.
        </p>
      </div>
    </main>
  );
}
