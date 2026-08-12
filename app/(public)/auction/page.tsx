export const metadata = {
  title: "Silent Auction . Nicho Halloween Festival",
};

// No lot grid until there are real lots. The catalogue will live on the
// bidding platform once one is chosen, and this page links out to it.
export default function AuctionPage() {
  return (
    <main className="min-h-screen bg-paper">
      {/* Dark hero band */}
      <div className="relative bg-forest-deep overflow-visible">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-10 md:py-12 flex flex-col md:flex-row items-center gap-8">
          {/* Text, left side */}
          <div className="md:w-1/2 relative z-10">
            <p className="font-mono text-sm uppercase tracking-[0.3em] text-pumpkin mb-3">
              Bid on something special
            </p>
            <h1 className="font-display font-bold text-6xl md:text-7xl text-bone mb-4 tracking-tight leading-none">
              Silent Auction
            </h1>
            <p className="font-body text-xl md:text-2xl text-paper/70">
              Every year our families and local businesses donate items and
              every dollar raised goes straight back to our school - you can
              bid from the comfort of your own couch
            </p>
          </div>

          {/* Ghost auctioneer polaroid, floating over both edges */}
          <div className="md:w-1/2 flex justify-center md:justify-end relative z-20 md:mt-[-40px] md:mb-[-60px]">
            <div className="-rotate-2 bg-bone p-4 pb-14 shadow-[4px_8px_24px_rgba(26,26,26,0.3),2px_3px_6px_rgba(26,26,26,0.15)] max-w-[380px]">
              <img
                src="/auctiony.png"
                alt="Ghost auctioneer with gavel"
                className="w-full"
              />
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-moss text-center mt-3">
                Going, going, gone!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status strip. Honest about where things are, no invented numbers. */}
      <div className="bg-bone border-b border-dotted border-mist">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-4">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-rust">
            Lots announced closer to the festival
          </span>
        </div>
      </div>

      <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-rust-deep mb-4">
            What to expect
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-ink mb-6 leading-tight">
            Items coming soon!
          </h2>
          <p className="font-body text-lg text-ink-soft mb-8">
            Every classroom puts together a set of lots, and local businesses
            add vouchers, stays, services and the occasional thing nobody
            expects.
          </p>

          <div className="border-t border-dotted border-mist pt-6">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-rust-deep mb-2">
              Donating a lot
            </p>
            <p className="font-body text-base text-ink-soft">
              If you run a local business and would like to donate something,
              we would love to hear from you. Email{" "}
              <a
                href="mailto:hello@nichohalloween.com.au"
                className="text-rust hover:text-rust-deep underline"
              >
                hello@nichohalloween.com.au
              </a>
              . Every donor is credited on the lot and thanked publicly.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
