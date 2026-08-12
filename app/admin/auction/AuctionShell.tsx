import AuctionTabs, { type AuctionTabKey } from "./AuctionTabs";
import { getAuctionTabCounts } from "./counts";

// Shared chrome for all three auction tabs. The heading never changes, so
// switching tabs swaps only the panel underneath.
export default async function AuctionShell({
  active,
  children,
}: {
  active: AuctionTabKey;
  children: React.ReactNode;
}) {
  const counts = await getAuctionTabCounts();

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-[1000px]">
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-rust-deep mb-1">
          Register
        </p>
        <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-ink">
          Silent auction
        </h1>
      </div>

      <AuctionTabs active={active} counts={counts} />

      <div
        id={`auction-panel-${active}`}
        role="tabpanel"
        aria-labelledby={`auction-tab-${active}`}
      >
        {children}
      </div>
    </div>
  );
}
