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

// Matches MAX_QTY_PER_LINE in app/api/checkout/route.ts. The server enforces
// it, this just stops the button going past it.
const MAX_QTY = 20;

export default function TokensPage() {
  const bundleEntries = Object.entries(BUNDLES) as [BundleType, (typeof BUNDLES)[BundleType]][];
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<Partial<Record<BundleType, number>>>({});

  function setQty(bundleType: BundleType, qty: number) {
    const clamped = Math.max(0, Math.min(MAX_QTY, qty));
    setCart((c) => {
      const next = { ...c };
      if (clamped === 0) delete next[bundleType];
      else next[bundleType] = clamped;
      return next;
    });
  }

  const lines = bundleEntries
    .filter(([type]) => (cart[type] ?? 0) > 0)
    .map(([type, bundle]) => ({
      type,
      bundle,
      qty: cart[type] as number,
      tokens: bundle.tokens * (cart[type] as number),
      cents: bundle.prePurchaseCents * (cart[type] as number),
    }));

  const totalTokens = lines.reduce((n, l) => n + l.tokens, 0);
  const totalCents = lines.reduce((n, l) => n + l.cents, 0);
  const totalAtFestival = lines.reduce(
    (n, l) => n + l.bundle.atFestivalCents * l.qty,
    0
  );

  async function handleCheckout() {
    if (lines.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Quantities only. Prices are read from BUNDLES on the server, never
        // sent from here.
        body: JSON.stringify({
          items: lines.map((l) => ({ bundleType: l.type, quantity: l.qty })),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        alert(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong. Please try again.");
      setLoading(false);
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
              <img src="/payup.webp" alt="Ghost in sunglasses" className="w-full" />
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
              // Rounded and glowing rather than boxed. pumpkin #D87A3F is the
              // brighter of the two oranges in the palette, so the glow reads
              // warm against cream without tipping into the rust used for
              // links and CTAs.
              className={`ticket-slide ticket-slide-${i} bg-bone rounded-3xl overflow-hidden shadow-[0_2px_24px_rgba(216,122,63,0.30)] hover:shadow-[0_10px_40px_rgba(216,122,63,0.55)] transition-all duration-300 hover:-translate-y-1 flex flex-col`}
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
              <div className="p-6 flex flex-col flex-1">
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
                  {formatCents(bundle.atFestivalCents)} at the festival, you&apos;re
                  saving {formatCents(bundle.atFestivalCents - bundle.prePurchaseCents)}!
                </p>

                {/* Quantity stepper. Starts at zero, so there is no separate
                    "add to cart" step to forget. */}
                <div className="mt-auto flex items-stretch rounded-full overflow-hidden border border-mist">
                  <button
                    onClick={() => setQty(bundleType, (cart[bundleType] ?? 0) - 1)}
                    disabled={loading || (cart[bundleType] ?? 0) === 0}
                    aria-label={`Remove one ${bundle.label} bundle`}
                    className="w-14 py-4 font-mono text-lg text-ink hover:bg-paper-deep transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    &minus;
                  </button>

                  <div className="flex-1 flex items-center justify-center border-x border-mist">
                    <span
                      aria-live="polite"
                      className="font-display font-bold text-2xl text-ink tabular-nums"
                    >
                      {cart[bundleType] ?? 0}
                    </span>
                    <span className="sr-only">
                      {bundle.label} bundles in your order
                    </span>
                  </div>

                  <button
                    onClick={() => setQty(bundleType, (cart[bundleType] ?? 0) + 1)}
                    disabled={loading || (cart[bundleType] ?? 0) >= MAX_QTY}
                    aria-label={`Add one ${bundle.label} bundle`}
                    className="w-14 py-4 font-mono text-lg bg-forest-deep text-bone hover:bg-rust transition-colors disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Order summary. Always present so the checkout does not appear from
            nowhere, but only actionable once something is chosen. */}
        <div className="mt-10 bg-bone rounded-3xl p-6 md:p-8 shadow-[0_2px_24px_rgba(216,122,63,0.30)]">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-rust-deep mb-4">
            Your order
          </p>

          {lines.length === 0 ? (
            <p className="font-body text-base italic text-moss">
              Choose your bundles above. You can mix them, for example two
              25-token bundles and one 200.
            </p>
          ) : (
            <>
              <ul className="mb-5 divide-y divide-dotted divide-mist">
                {lines.map((l) => (
                  <li
                    key={l.type}
                    className="flex items-baseline justify-between gap-4 py-2"
                  >
                    <span className="font-body text-base text-ink">
                      {l.qty} &times; {l.bundle.label}
                      <span className="text-moss"> ({l.tokens} tokens)</span>
                    </span>
                    <span className="font-mono text-sm text-ink tabular-nums">
                      {formatCents(l.cents)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex items-baseline justify-between gap-4 border-t border-dotted border-mist pt-4 mb-1">
                <span className="font-display font-bold text-2xl text-ink">
                  {totalTokens} tokens
                </span>
                <span className="font-display font-bold text-3xl text-ink tabular-nums">
                  {formatCents(totalCents)}
                </span>
              </div>

              <p className="font-body text-sm italic text-moss mb-6">
                {formatCents(totalAtFestival)} at the festival, you&apos;re saving{" "}
                {formatCents(totalAtFestival - totalCents)}!
              </p>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full rounded-full bg-forest-deep text-bone font-mono text-sm uppercase tracking-[0.3em] py-5 hover:bg-rust transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Redirecting..." : `Checkout . ${formatCents(totalCents)}`}
              </button>
            </>
          )}
        </div>

        <p className="font-body text-sm italic text-moss text-center mt-10">
          Pre-purchase closes at midnight the day before the festival. Bring your
          confirmation email to the Token Booth on the day.
        </p>
      </div>
    </main>
  );
}
