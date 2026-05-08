import { BUNDLES, formatCents } from "@/lib/bundles";

export default function TokensPage() {
  const bundles = Object.values(BUNDLES);

  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <p className="font-mono text-sm uppercase tracking-widest text-rust-deep mb-2">
          Get your tokens
        </p>
        <h1 className="font-display text-5xl md:text-6xl text-ink mb-4">
          Token Bundles
        </h1>
        <p className="font-body text-lg text-ink-soft max-w-2xl mb-12">
          Tokens are how you pay for everything at the festival. Pre-purchase
          online and save 15% off the festival-day price.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bundles.map((bundle) => (
            <div
              key={bundle.tokens}
              className="bg-bone border border-mist p-6 flex flex-col items-center text-center"
            >
              <p className="font-mono text-xs uppercase tracking-widest text-moss mb-2">
                {bundle.tokens} tokens
              </p>
              <p className="font-display text-4xl text-ink mb-1">
                {formatCents(bundle.prePurchaseCents)}
              </p>
              <p className="font-mono text-xs text-moss line-through mb-4">
                {formatCents(bundle.atFestivalCents)} at festival
              </p>
              <button
                className="w-full bg-forest text-paper font-mono text-sm uppercase tracking-widest py-3 hover:bg-forest-deep transition-colors"
                disabled
              >
                Coming soon
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
