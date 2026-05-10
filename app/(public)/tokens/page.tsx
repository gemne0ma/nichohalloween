"use client";

import { useState } from "react";
import { BUNDLES, formatCents, type BundleType } from "@/lib/bundles";

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
          0% {
            opacity: 0;
            transform: translateX(60px) rotate(3deg);
          }
          70% {
            opacity: 1;
            transform: translateX(-4px) rotate(-0.5deg);
          }
          100% {
            opacity: 1;
            transform: translateX(0) rotate(0deg);
          }
        }
        .ticket-slide {
          animation: ticketSlide 0.5s cubic-bezier(0.25, 1, 0.5, 1) both;
        }
        .ticket-slide-0 { animation-delay: 0.1s; }
        .ticket-slide-1 { animation-delay: 0.22s; }
        .ticket-slide-2 { animation-delay: 0.34s; }
        .ticket-slide-3 { animation-delay: 0.46s; }

        .ticket-perforation {
          border-left: 3px dashed #A8AC9F;
        }
      `}</style>

      {/* Content: image left, cards right */}
      <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">

          {/* Ghost image as tilted polaroid */}
          <div className="md:w-1/2 flex-shrink-0 flex justify-center">
            <div className="-rotate-2 bg-bone p-4 pb-14 shadow-[3px_5px_16px_rgba(26,26,26,0.18),1px_2px_4px_rgba(26,26,26,0.1)] max-w-[520px]">
              <img
                src="/payup.png"
                alt="Ghost in sunglasses"
                className="w-full"
              />
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
            <p className="font-body text-xl text-ink-soft max-w-2xl mb-12">
              Tokens are how you pay for everything at the festival. Pre-purchase
              online and save 15% off the festival-day price.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {bundleEntries.map(([bundleType, bundle], i) => (
                <div
                  key={bundle.tokens}
                  className={`ticket-slide ticket-slide-${i} bg-bone shadow-[0_2px_12px_rgba(26,26,26,0.12),0_1px_3px_rgba(26,26,26,0.08)] hover:shadow-[0_4px_20px_rgba(26,26,26,0.18),0_2px_6px_rgba(26,26,26,0.1)] transition-all hover:-translate-y-1 flex overflow-hidden`}
                >
                  {/* Stub (left side, the tear-off) */}
                  <div className="w-[90px] flex-shrink-0 bg-rust flex flex-col items-center justify-center py-6 relative">
                    {/* Half-circle cutouts at perforation edge */}
                    <div className="absolute -right-[8px] top-[20px] w-4 h-4 rounded-full bg-bone" />
                    <div className="absolute -right-[8px] bottom-[20px] w-4 h-4 rounded-full bg-bone" />

                    <p className="font-display font-bold text-4xl text-paper leading-none">
                      {bundle.tokens}
                    </p>
                    <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-paper/70 mt-1">
                      tokens
                    </p>
                  </div>

                  {/* Main ticket body (right side) */}
                  <div className="ticket-perforation flex-1 py-6 px-6 flex flex-col">
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist mb-4">
                      Admit bearer &middot; Sat 24 Oct
                    </p>

                    <div className="mt-auto">
                      <p className="font-display font-bold text-3xl text-ink mb-0.5">
                        {formatCents(bundle.prePurchaseCents)}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist line-through mb-4">
                        {formatCents(bundle.atFestivalCents)} at festival
                      </p>

                      <button
                        onClick={() => handleBuy(bundleType)}
                        disabled={loading !== null}
                        aria-label={`Buy ${bundle.label} for ${(bundle.prePurchaseCents / 100).toFixed(0)} dollars`}
                        className="w-full bg-forest-deep text-bone font-mono text-[10px] uppercase tracking-[0.3em] py-2.5 hover:bg-rust transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading === bundleType ? "Redirecting..." : "Buy now"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
