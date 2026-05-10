const GRADIENTS = [
  "from-forest to-forest-deep",
  "from-plum to-forest-deep",
  "from-rust to-rust-deep",
  "from-moss to-plum",
  "from-pumpkin to-rust-deep",
  "from-ink-soft to-ink",
  "from-forest-deep to-plum",
  "from-rust-deep to-forest",
  "from-plum to-rust",
  "from-moss to-forest-deep",
];

// Varying image heights for the masonry effect
const HEIGHTS = [
  "h-[220px]",
  "h-[180px]",
  "h-[260px]",
  "h-[200px]",
  "h-[240px]",
  "h-[190px]",
  "h-[250px]",
  "h-[210px]",
  "h-[170px]",
  "h-[230px]",
];

type AuctionLot = {
  lotNumber: string;
  title: string;
  donor: string;
  estimatedValue: string;
  gradient: string;
  height: string;
  image?: string;
};

const AUCTION_LOTS: AuctionLot[] = Array.from({ length: 40 }, (_, i) => ({
  lotNumber: String(i + 1).padStart(3, "0"),
  title: `Auction Item ${i + 1}`,
  donor: "Donor TBC",
  estimatedValue: "TBC",
  gradient: GRADIENTS[i % GRADIENTS.length],
  height: HEIGHTS[i % HEIGHTS.length],
}));

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
              Browse and bid on the following incredible items donated to support
              our spook-tacular school, all from the comfort of your couch! But
              keep an eye out, you never know who&apos;s waiting to outbid you!
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

      {/* Stats ribbon */}
      <div className="bg-bone border-b border-dotted border-mist">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-4 flex flex-wrap gap-4 md:gap-8 items-center">
          <div>
            <span className="font-display text-2xl text-forest">40+</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-moss ml-2">lots</span>
          </div>
          <div>
            <span className="font-display text-2xl text-forest">$15,000+</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-moss ml-2">est. value</span>
          </div>
          <div className="ml-auto">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-rust">Bidding opens soon</span>
          </div>
        </div>
      </div>

      <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-12">
        {/* Masonry grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {AUCTION_LOTS.map((lot) => (
            <div
              key={lot.lotNumber}
              className="break-inside-avoid bg-bone overflow-hidden shadow-[0_2px_12px_rgba(26,26,26,0.12),0_1px_3px_rgba(26,26,26,0.08)] hover:shadow-[0_4px_20px_rgba(26,26,26,0.18),0_2px_6px_rgba(26,26,26,0.1)] transition-all hover:-translate-y-1"
            >
              {/* Image placeholder */}
              {lot.image ? (
                <img
                  src={lot.image}
                  alt={lot.title}
                  className={`w-full ${lot.height} object-cover`}
                />
              ) : (
                <div
                  className={`w-full ${lot.height} bg-gradient-to-br ${lot.gradient} flex items-center justify-center`}
                >
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-paper/40">
                    Photo coming soon
                  </span>
                </div>
              )}

              {/* Card body */}
              <div className="p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-rust-deep mb-2">
                  Lot {lot.lotNumber}
                </p>
                <h2 className="font-display text-xl md:text-2xl text-ink tracking-wide leading-tight mb-1">
                  {lot.title}
                </h2>
                <p className="font-body text-sm text-moss italic mb-3">
                  Donated by {lot.donor}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-dotted border-mist">
                  <span className="font-display text-lg text-forest">
                    Est. {lot.estimatedValue}
                  </span>
                  <a
                    href="#"
                    className="inline-block font-mono text-[10px] uppercase tracking-[0.2em] bg-forest-deep text-bone px-4 py-2 hover:bg-rust transition-colors"
                  >
                    Place a bid
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
