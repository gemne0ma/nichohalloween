import Image from "next/image";

// Hardcoded on purpose. Gemma's call, 14 August 2026: the six confirmed
// sponsors are a short, stable list for this festival, and a code change per
// sponsor is an acceptable trade for not depending on the database here.
//
// Adding a sponsor means adding a row below, dropping the logo into
// public/images/sponsor-logos/, and deploying. The admin sponsors register is
// still the internal record for money and contacts, it just no longer feeds
// this page.
//
// Names are written as they should appear publicly. The "TBC - " prefix used
// in the database is internal shorthand and must never reach this file.
type Tier = "gold" | "silver" | "bronze";

type Sponsor = {
  name: string;
  tier: Tier;
  url: string;
  logo: string;
  // Real pixel dimensions, so next/image reserves the right space.
  width: number;
  height: number;
  // Logos are supplied on a baked-in background. Five are white, so the plate
  // is white by default. Where a logo arrives on its own colour, the plate
  // matches it, otherwise you get a coloured rectangle sitting inside a white
  // one, which reads as a mistake rather than a brand.
  plateBg?: string;
  // Some logos are supplied with a lot of empty canvas around the mark, so
  // object-contain fits the whitespace rather than the artwork and they read
  // smaller than everyone else. Scales the image only, not the layout box.
  logoScale?: number;
  // Nudge the logo within its plate, in CSS pixels. Negative is up. Useful
  // when the mark sits off-centre on its own canvas.
  logoOffsetY?: number;
};

const SPONSORS: Sponsor[] = [
  {
    name: "Bresic Whitney",
    url: "https://bresicwhitney.com.au/",
    tier: "gold",
    logo: "/images/sponsor-logos/bresic-whitney.jpg",
    width: 900,
    height: 900,
  },
  {
    name: "Aussie Home Loans",
    url: "https://www.aussie.com.au",
    tier: "silver",
    logo: "/images/sponsor-logos/aussiebalmain.webp",
    width: 1080,
    height: 1080,
    // Sampled from the file, uniform across all eight edge samples.
    plateBg: "#4B1F68",
  },
  {
    name: "Prestige Auto",
    url: "https://prestigeautotraders.com.au/",
    tier: "silver",
    logo: "/images/sponsor-logos/prestige-auto.jpeg",
    width: 325,
    height: 325,
    // Averaged across the whole border, which varies by only 3 levels, so
    // the plate meets the image with no visible seam.
    plateBg: "#192E5B",
  },
  {
    name: "Ballast Point Architects + Builders",
    url: "https://ballastpoint.com.au/",
    tier: "bronze",
    // Trimmed to the type. The supplied file was a rounded square with the
    // mark in the lower left and 56% of the canvas empty above it, plus solid
    // black corners where transparency should have been. Cropping to the
    // artwork means it fills its box at natural size, so no scale or nudge is
    // needed and nothing bleeds past the plate.
    logo: "/images/sponsor-logos/ballast-point-trimmed.png",
    width: 342,
    height: 210,
  },
  {
    name: "Balmain Vet",
    url: "https://www.balmainvet.com.au/",
    tier: "bronze",
    logo: "/images/sponsor-logos/balmain-vet.jpeg",
    width: 449,
    height: 445,
  },
  {
    name: "Vision Personal Training",
    url: "https://www.visionpersonaltraining.com/",
    tier: "bronze",
    logo: "/images/sponsor-logos/vision-personal-training.jpeg",
    width: 447,
    height: 447,
    // Perfectly uniform across the border, spread of zero.
    plateBg: "#EB0029",
  },
  {
    name: "The Little Marionette",
    url: "https://thelittlemarionette.com/",
    tier: "bronze",
    logo: "/images/sponsor-logos/littlem.webp",
    width: 2266,
    height: 1238,
    // Sampled from the file itself, not guessed.
    plateBg: "#B7D5DF",
  },
];

// Gold carries the most weight because it paid for it. 40pt on the gold name
// as asked, with silver and bronze stepped down so the hierarchy survives.
// Every size drops on mobile: 40pt is 53px, and "Ballast Point Architects +
// Builders" at 53px on a 390px screen runs to four lines.
const TIER_STYLES: Record<
  Tier,
  { name: string; plate: string; grid: string; heading: string }
> = {
  gold: {
    name: "text-[26pt] md:text-[40pt]",
    plate: "h-[220px] md:h-[300px]",
    grid: "grid grid-cols-1",
    heading: "Gold Sponsor",
  },
  silver: {
    name: "text-[20pt] md:text-[28pt]",
    plate: "h-[150px] md:h-[200px]",
    grid: "grid grid-cols-1 sm:grid-cols-2 gap-8",
    heading: "Silver Sponsors",
  },
  bronze: {
    name: "text-[16pt] md:text-[22pt]",
    plate: "h-[120px] md:h-[150px]",
    // Four bronze sponsors, so two by two rather than three across leaving a
    // widow on the second row.
    grid: "grid grid-cols-1 sm:grid-cols-2 gap-8",
    heading: "Bronze Sponsors",
  },
};

function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const style = TIER_STYLES[sponsor.tier];
  // The ghost's sign reads "to our gold sponsor", so it belongs to gold and
  // nowhere else.
  const isGold = sponsor.tier === "gold";

  return (
    // The whole card is the link, so the logo, the name and the pill are all
    // clickable rather than just the pill. New tab, because sending someone
    // off the festival site mid-visit loses them. rel guards against the
    // opened page reaching back through window.opener.
    <a
      href={sponsor.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit the ${sponsor.name} website, opens in a new tab`}
      // No outline. A rust glow does the work instead, at 22% resting and 45%
      // on hover, with a small downward offset so the card sits on the page
      // rather than floating in a halo. rust is #B85C2E, the same accent as
      // the pills and CTAs.
      className="group bg-bone shadow-[0_2px_20px_rgba(184,92,46,0.22)] hover:shadow-[0_8px_34px_rgba(184,92,46,0.45)] transition-all duration-300 hover:-translate-y-1 flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-rust focus-visible:ring-offset-2 focus-visible:ring-offset-paper">
      {/* Plate behind the logo, white unless the sponsor supplies otherwise.
          Logos arrive with their background baked in, so the plate matches it:
          a cream tile would show a white rectangle inside it, and a white tile
          would show The Little Marionette's blue one. */}
      <div
        className={`${style.plate} relative flex items-center justify-center p-6 md:p-8`}
        style={{ backgroundColor: sponsor.plateBg ?? "#FFFFFF" }}
      >
        {isGold && (
          // Top right, tilted the opposite way to the ghost so the two lean
          // into each other rather than sitting parallel. Same rules as him:
          // desktop only, decorative, and never intercepting a click.
          <Image
            src="/images/sponsor-logos/gold-sponsor-badge.png"
            alt=""
            aria-hidden
            width={1536}
            height={1024}
            className="hidden md:block pointer-events-none select-none absolute top-[-6%] right-[-2%] h-[44%] w-auto rotate-[6deg] origin-top-right"
          />
        )}

        {isGold && (
          // Desktop only: at 390px there is no room for a ghost and a logo
          // side by side. Anchored to the bottom and pulled left so his
          // kicking leg breaks past the card edge, which is the point of him.
          // pointer-events-none so he never swallows a click meant for the
          // card link. aria-hidden because the link already announces itself
          // and this is decoration.
          <Image
            src="/images/sponsor-logos/jauntyghost.png"
            alt=""
            aria-hidden
            width={1224}
            height={1285}
            className="hidden md:block pointer-events-none select-none absolute bottom-0 left-[-4%] h-[104%] w-auto -rotate-[5deg] origin-bottom-left"
          />
        )}

        <Image
          src={sponsor.logo}
          alt={`${sponsor.name} logo`}
          width={sponsor.width}
          height={sponsor.height}
          className="relative max-h-full w-auto max-w-full object-contain"
          // translate is declared before scale on purpose. CSS applies these
          // right to left, so the element is scaled first and then shifted by
          // a true 20px. The other order would scale the shift too, moving it
          // 28px instead.
          style={
            sponsor.logoScale || sponsor.logoOffsetY
              ? {
                  transform: [
                    sponsor.logoOffsetY
                      ? `translateY(${sponsor.logoOffsetY}px)`
                      : null,
                    sponsor.logoScale ? `scale(${sponsor.logoScale})` : null,
                  ]
                    .filter(Boolean)
                    .join(" "),
                }
              : undefined
          }
        />
      </div>

      <div className="px-6 py-5 text-center">
        <p
          className={`font-display font-bold ${style.name} text-ink leading-[1.05]`}
        >
          {sponsor.name}
        </p>

        {/* Decorative: the anchor already carries the accessible name, so
            this is a visual affordance rather than a second link. */}
        <span
          aria-hidden
          className="inline-block mt-3 font-mono text-[9px] uppercase tracking-[0.15em] bg-rust text-bone rounded-full px-3 py-1 group-hover:bg-rust-deep transition-colors"
        >
          Click for website
        </span>
      </div>
    </a>
  );
}

function TierSection({ tier }: { tier: Tier }) {
  const list = SPONSORS.filter((s) => s.tier === tier);
  if (list.length === 0) return null;

  const style = TIER_STYLES[tier];

  return (
    <div className="mb-16 last:mb-0">
      <div className="flex items-center gap-4 mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-rust-deep whitespace-nowrap">
          {style.heading}
        </p>
        <span className="h-px bg-mist flex-1" aria-hidden />
      </div>

      {/* One gold sponsor this year, so it takes the full width rather than
          sitting in a half-empty two-column row. */}
      <div className={style.grid}>
        {list.map((s) => (
          <SponsorCard key={s.name} sponsor={s} />
        ))}
      </div>
    </div>
  );
}

export default function SponsorsPage() {
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
              The Nicho Halloween Festival is made possible by the incredible
              support of local businesses. We are so grateful for their
              generosity, and encourage you to support them in turn.
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

      <section className="max-w-[1200px] mx-auto px-6 md:px-10 pb-20">
        <TierSection tier="gold" />
        <TierSection tier="silver" />
        <TierSection tier="bronze" />

        <p className="font-body text-base italic text-moss text-center mt-16">
          Interested in sponsoring the festival? Email{" "}
          <a
            href="mailto:hello@nichohalloween.com.au"
            className="text-rust hover:text-rust-deep underline"
          >
            hello@nichohalloween.com.au
          </a>
          .
        </p>
      </section>
    </main>
  );
}
