import { getPublishedSponsors, type PublicSponsor } from "./queries";

function SponsorCard({
  name,
  logo,
  size,
}: {
  name: string;
  logo: string | null;
  size: "gold" | "silver" | "bronze";
}) {
  const sizeClasses = {
    gold: "aspect-[16/9]",
    silver: "aspect-[4/3]",
    bronze: "aspect-[4/3]",
  };

  return (
    <div
      className={`${sizeClasses[size]} bg-bone shadow-[0_2px_12px_rgba(26,26,26,0.12),0_1px_3px_rgba(26,26,26,0.08)] hover:shadow-[0_4px_20px_rgba(26,26,26,0.18),0_2px_6px_rgba(26,26,26,0.1)] transition-all hover:-translate-y-1 flex items-center justify-center overflow-hidden ${size === "gold" ? "border-t-4 border-rust" : ""}`}
    >
      {logo ? (
        <img src={logo} alt={name} className="max-h-full max-w-[80%] object-contain p-6" />
      ) : (
        <div className="text-center p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-mist">
            {name}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist/60 mt-1">
            Logo coming soon
          </p>
        </div>
      )}
    </div>
  );
}

export default async function SponsorsPage() {
  const sponsors = await getPublishedSponsors();

  // Group once. A sponsor with no tier set is not shown: there is no section
  // for it, and guessing a tier on a public page is worse than omitting it.
  const byTier = {
    gold: sponsors.filter((s) => s.tier === "gold"),
    silver: sponsors.filter((s) => s.tier === "silver"),
    bronze: sponsors.filter((s) => s.tier === "bronze"),
  };

  const sections: {
    key: "gold" | "silver" | "bronze";
    heading: string;
    grid: string;
    list: PublicSponsor[];
  }[] = [
    {
      key: "gold",
      heading: "Gold Sponsors",
      grid: "grid grid-cols-1 sm:grid-cols-2 gap-6",
      list: byTier.gold,
    },
    {
      key: "silver",
      heading: "Silver Sponsors",
      grid: "grid grid-cols-2 sm:grid-cols-4 gap-6",
      list: byTier.silver,
    },
    {
      key: "bronze",
      heading: "Bronze Sponsors",
      grid: "grid grid-cols-2 sm:grid-cols-4 gap-6",
      list: byTier.bronze,
    },
  ];

  // Only sections with published sponsors render.
  const visibleSections = sections.filter((section) => section.list.length > 0);

  return (
    <main className="min-h-screen bg-paper">
      {/* Hero: header left, thank-you ghost polaroid right */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="md:w-1/2">
            <p className="font-mono text-sm uppercase tracking-[0.3em] text-rust-deep mb-3">
              Our supporters
            </p>
            <h1 className="font-display font-bold text-6xl md:text-7xl text-ink mb-4 tracking-tight leading-none">
              Sponsors
            </h1>
            <p className="font-body text-xl md:text-2xl text-ink-soft max-w-lg">
              The Nicho Halloween Festival is made possible by the incredible support
              of local businesses. We are so grateful for their generosity, and
              encourage you to support them in turn.
            </p>
          </div>

          {/* Thank-you ghost polaroid */}
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <div className="-rotate-2 bg-bone p-4 pb-14 shadow-[4px_8px_24px_rgba(26,26,26,0.3),2px_3px_6px_rgba(26,26,26,0.15)] max-w-[340px]">
              <img
                src="/thanks.png"
                alt="Ghost in a yellow hat holding a Thank You sign"
                className="w-full aspect-[3/4] object-cover"
              />
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-moss text-center mt-3">
                We couldn&apos;t do it without you
              </p>
            </div>
          </div>
        </div>
      </div>

      {visibleSections.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 pb-20">
          {visibleSections.map((section, i) => (
            <div
              key={section.key}
              className={i < visibleSections.length - 1 ? "mb-12" : ""}
            >
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-rust-deep mb-4">
                {section.heading}
              </p>
              <div className={section.grid}>
                {section.list.map((sponsor) => (
                  <SponsorCard
                    key={sponsor.name}
                    name={sponsor.name}
                    logo={sponsor.logoUrl}
                    size={section.key}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
