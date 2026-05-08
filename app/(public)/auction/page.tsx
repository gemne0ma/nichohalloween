export default function AuctionPage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <p className="font-mono text-sm uppercase tracking-widest text-rust-deep mb-2">
          Bid on something special
        </p>
        <h1 className="font-display text-5xl md:text-6xl text-ink mb-4">
          Silent Auction
        </h1>
        <p className="font-body text-lg text-ink-soft max-w-2xl mb-8">
          Each classroom curates a unique auction item. Browse the lots here,
          then place your bid on 32auctions. Bidding opens closer to the
          festival.
        </p>
        <p className="font-body text-lg text-ink-soft">
          Auction items will appear here as classrooms submit them.
        </p>
      </div>
    </main>
  );
}
