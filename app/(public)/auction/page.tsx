import Image from "next/image";

export const metadata = {
  title: "Silent Auction . Nicho Halloween Festival",
};

// Bidding happens on Air Auctioneer, not here. This page is a showcase so
// people can see what is up for grabs without creating an account first, and
// every route to actually bidding goes to the same URL.
const AIR_AUCTIONEER =
  "https://airauctioneer.com/nicholson-street-ps-halloween-festival-silent-auction";

// Mirrored by hand from the Air Auctioneer catalogue on 10 September 2026.
// THIS LIST DOES NOT SYNC. If a lot is added, withdrawn or renamed over
// there, this page keeps showing the old version until someone edits it.
// Check it against the catalogue before the festival.
//
// `slug` deep links to that lot's own page on Air Auctioneer, so clicking a
// card lands on the bidding form for that item rather than the catalogue.
//
// Every slug below was verified by fetching it and confirming the lot name
// appears in the page title. That check matters: Air Auctioneer answers 200
// for slugs that do not exist and quietly renders the catalogue instead, so
// a status code proves nothing. Scenic World is the one that caught it out.
// Their title reads "2adults" with no space, so the obvious slug was wrong
// and would have dumped bidders on the catalogue with no sign anything had
// gone astray. If you add a lot here, verify its slug the same way.
type Lot = {
  title: string;
  donor: string;
  image: string;
  slug: string;
  value?: string;
  // Shown when several near-identical lots run together, e.g. the four East
  // Village Hotel vouchers, so it is clear they are four separate things to
  // bid on rather than the same card repeated.
  note?: string;
};

const LOTS: Lot[] = [
  { title: "2 hour harbour cruise on Iluka", donor: "Iluka", image: "iluka-cruise", value: "$2,480", slug: "2-hour-harbour-cruise-on-iluka" },
  // Filename changed from verve-portraits on purpose. The crop was corrected
  // in place and browsers kept serving the old cached bytes off the unchanged
  // URL, so the fix looked like it had failed. A new filename is a new URL.
  { title: "Photoshoot", donor: "Verve", image: "verve-photoshoot", value: "$1,200", slug: "verve-photoshoot-value-1200" },
  { title: "Intimates photoshoot", donor: "Verve Intimates", image: "verve-intimates", value: "$695", slug: "verve-intimates-photoshoot-value-695" },
  { title: "$350 voucher", donor: "Dry Dock Hotel", image: "dry-dock", value: "$350", slug: "dry-dock-hotel-350-voucher" },

  // Four separate vouchers, four separate lots, four separate bids. $1,000 of
  // East Village Hotel in total. Each card links to its own lot.
  { title: "$250 voucher", donor: "East Village Hotel", image: "evh", value: "$250", note: "1 of 4", slug: "east-village-hotel-evh-250-voucher" },
  { title: "$250 voucher", donor: "East Village Hotel", image: "evh", value: "$250", note: "2 of 4", slug: "east-village-hotel-evh-250-voucher-2" },
  { title: "$250 voucher", donor: "East Village Hotel", image: "evh", value: "$250", note: "3 of 4", slug: "east-village-hotel-evh-250-voucher-3" },
  { title: "$250 voucher", donor: "East Village Hotel", image: "evh", value: "$250", note: "4 of 4", slug: "east-village-hotel-evh-250-voucher-4" },

  { title: "$200 voucher", donor: "Walls Pharmacy", image: "walls-pharmacy", value: "$200", slug: "walls-pharmacy-200-voucher" },

  // Listed twice on Air Auctioneer, so shown twice here for the same reason.
  { title: "10 training sessions and 10 recovery sessions", donor: "Combine Air", image: "combine-air", note: "1 of 2", slug: "combine-air-10-training-sessions-10-x-recovery-sessions" },
  { title: "10 training sessions and 10 recovery sessions", donor: "Combine Air", image: "combine-air", note: "2 of 2", slug: "combine-air-10-x-training-sessions-and-10-x-recovery-sessions" },

  { title: "Family pass", donor: "Taronga Zoo", image: "taronga-zoo", slug: "taronga-zoo-family-pass" },
  // Their title really does read "2adults" with no space. Do not tidy it.
  { title: "Family pass, 2 adults and 2 children", donor: "Scenic World", image: "scenic-world", slug: "scenic-world-family-pass-2adults-2-children" },
  { title: "2 adult vouchers, Afternoon Discovery Cruise", donor: "Sydney Tall Ships", image: "tall-ships", slug: "sydney-tall-ships-2-x-adult-voucher-for-afternoon-discovery-cruise" },
  { title: "Bathhouse experience", donor: "Nature's Energy", image: "natures-energy", slug: "natures-energy-bathhouse-experience" },
  { title: "Couples Flauna, float and sauna", donor: "City Cave", image: "city-cave", slug: "city-cave-couples-flauna-float-sauna" },
  { title: "Unlimited rides pass x 4", donor: "Luna Park", image: "luna-park", slug: "unlimited-rides-pass-x-4" },
  { title: "2 day passes", donor: "Sydney Action Park, formerly Raging Waters", image: "sydney-action-park", slug: "sydney-action-park-frmly-raging-waters-2x-day-passes" },
  { title: "Family pass", donor: "Sydney Kings and Sydney Flames", image: "sydney-kings", slug: "family-pass-to-sydney-kings-sydney-flames" },
  { title: "Family pass", donor: "Sydney Indoor Climbing Centre", image: "climbing-centre", slug: "sydney-indoor-climbing-centre-family-pass" },
  { title: "Ground tour", donor: "Sydney Cricket Ground", image: "scg-tours", slug: "sydney-cricket-ground-scg-tours" },
  { title: "3 day holiday camp", donor: "Balmain District Football Club", image: "balmain-fc", slug: "balmain-district-football-club-3-day-holiday-camp" },
  { title: "Holiday camp, 3 day pass", donor: "Sydney Uni Sports", image: "sydney-uni-sports", slug: "sydney-uni-sports-holiday-camp-3-day-pass" },
  { title: "$100 voucher", donor: "Hyperkarting", image: "hyperkarting", value: "$100", slug: "hyperkarting-100-voucher" },
  { title: "Holiday art classes", donor: "Paper, Rock, Scissors", image: "paper-rock-scissors", slug: "paper-rock-scissors-holiday-art-classes" },
  { title: "6 pack of assorted wines", donor: "DRNKS", image: "drnks", slug: "6pk-assorted-wines-from-drnks" },
  // Two separate $100 vouchers, so two cards. This pair was the lot missing
  // from the first pass, which is why the page showed 33 of Air Auctioneer's
  // 34. Each gets its own photo rather than the same one twice.
  { title: "$100 voucher", donor: "Eat at Robs", image: "eat-at-robs-signs", value: "$100", note: "1 of 2", slug: "eat-at-robs-x-100-voucher" },
  { title: "$100 voucher", donor: "Eat at Robs", image: "eat-at-robs-burgers", value: "$100", note: "2 of 2", slug: "eat-at-robs-x-100-voucher-2" },
  { title: "$100 voucher", donor: "Eden Pasticceria Five Dock", image: "eden-pasticceria", value: "$100", slug: "eden-pasticceria-five-dock-100-voucher" },
  { title: "Healthfoods voucher", donor: "The Source Bulk Foods Balmain", image: "the-source", slug: "the-source-healthfoods-balmain" },
  { title: "Full body massage and 2 gift bags of scalp care", donor: "Scalp Spa", image: "scalp-spa", slug: "scalp-spa-full-body-massage-2-gift-bags-of-scalp-care" },
  { title: "Bespoke facial", donor: "Suede Clinic", image: "suede-clinic", slug: "suede-clinic-bespoke-facial" },
  { title: "Yoga and pilates gift certificate", donor: "Soul Agenda", image: "soul-agenda", slug: "soul-agenda-yoga-pilates-gift-certificate" },
  { title: "2 luxurious candles and a voucher", donor: "House of SNJ Candles", image: "snj-candles", slug: "house-of-snj-candles-2-luxurious-candles-and-voucher" },
];

function BidButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={AIR_AUCTIONEER}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block font-mono text-xs uppercase tracking-[0.25em] bg-rust text-bone px-8 py-4 hover:bg-rust-deep transition-colors ${className}`}
    >
      Place a bid
    </a>
  );
}

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
            <BidButton className="mt-6" />
          </div>

          {/* Ghost auctioneer polaroid, floating over both edges */}
          <div className="md:w-1/2 flex justify-center md:justify-end relative z-20 md:mt-[-40px] md:mb-[-60px]">
            <div className="-rotate-2 bg-bone p-4 pb-14 shadow-[4px_8px_24px_rgba(26,26,26,0.3),2px_3px_6px_rgba(26,26,26,0.15)] max-w-[380px]">
              <img
                src="/auctiony.webp"
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

      {/* Status strip */}
      <div className="bg-bone border-b border-dotted border-mist">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-4">
          {/* Goes to the catalogue root rather than any single lot, since this
              strip is about the auction as a whole. */}
          <a
            href={AIR_AUCTIONEER}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-[0.2em] text-rust hover:text-rust-deep underline underline-offset-4 decoration-dotted transition-colors"
          >
            Bidding is open on Air Auctioneer
          </a>
        </div>
      </div>

      <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="max-w-2xl mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-rust-deep mb-4">
            What&apos;s up for grabs
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-ink mb-6 leading-tight">
            This year&apos;s lots
          </h2>
          <p className="font-body text-lg text-ink-soft">
            Local businesses have been extraordinarily generous. Have a look at
            what is on offer, then head to Air Auctioneer to place your bid.
          </p>
        </div>

        {/* Lot grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {LOTS.map((lot) => (
            <a
              key={lot.slug}
              href={`${AIR_AUCTIONEER}/${lot.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-bone border-t-4 border-rust overflow-hidden flex flex-col shadow-[0_2px_12px_rgba(26,26,26,0.12)] hover:shadow-[0_4px_20px_rgba(26,26,26,0.18)] hover:-translate-y-1 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rust focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              <div className="relative">
                <Image
                  src={`/images/auction/${lot.image}.webp`}
                  alt={`${lot.donor}, ${lot.title}`}
                  width={760}
                  height={570}
                  className="w-full aspect-[4/3] object-cover"
                />
                {lot.value && (
                  <span className="absolute top-3 right-3 font-mono text-[10px] uppercase tracking-[0.15em] bg-forest-deep text-bone px-3 py-1.5">
                    Valued at {lot.value}
                  </span>
                )}
              </div>

              <div className="p-6 flex flex-col flex-1">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-rust-deep mb-2">
                  {lot.donor}
                </p>
                <h3 className="font-display text-xl md:text-2xl text-ink tracking-wide leading-tight">
                  {lot.title}
                </h3>

                <div className="mt-4 pt-3 border-t border-dotted border-mist flex items-center justify-between gap-3">
                  <span className="font-mono text-xs uppercase tracking-[0.15em] text-moss">
                    {lot.note ?? "One to win"}
                  </span>
                  <span
                    aria-hidden
                    className="font-mono text-[10px] uppercase tracking-[0.15em] text-rust group-hover:text-rust-deep transition-colors"
                  >
                    Bid &rarr;
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-14">
          <BidButton />
        </div>

        <div className="border-t border-dotted border-mist pt-6 mt-16 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-rust-deep mb-2">
            Donating a lot
          </p>
          <p className="font-body text-base text-ink-soft">
            If you run a local business and would like to donate something, we
            would love to hear from you. Email{" "}
            <a
              href="mailto:hello@nichohalloween.com.au"
              className="text-rust hover:text-rust-deep underline"
            >
              hello@nichohalloween.com.au
            </a>
            . Every donor is credited on the lot and thanked publicly.
          </p>
        </div>
      </section>
    </main>
  );
}
