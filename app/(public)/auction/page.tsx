import Image from "next/image";

export const metadata = {
  title: "Bresic Whitney's Silent Auction . Nicho Halloween Festival",
};

// Bidding happens on Air Auctioneer, not here. This page is a showcase so
// people can see what is up for grabs without creating an account first, and
// every route to actually bidding goes to the same URL.
const AIR_AUCTIONEER =
  "https://airauctioneer.com/nicholson-street-ps-halloween-festival-silent-auction";

// Mirrored by hand from the Air Auctioneer catalogue on 10 September 2026,
// then again on 13 September 2026 when a second upload took it from 34 lots
// to 41, and once more on 15 September 2026 for the District lamp, 42.
// THIS LIST DOES NOT SYNC. If a lot is added, withdrawn or renamed over
// there, this page keeps showing the old version until someone edits it.
// Check it against the catalogue before the festival.
//
// `value` is read off each lot's own page on Air Auctioneer. The catalogue
// listing does not show values, only the individual lot pages do. 41 of the 42
// lots carry one and they total $12,641. Two exceptions, both deliberate:
// Principal for the Day is listed as "Priceless!" so it has no `value` at all,
// and Pepperwhites has no value line on Air Auctioneer, so its $100 is the
// voucher's face value off the lot title.
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
  { title: "Rum tasting and distillery tour", donor: "Red Mill Distillery", image: "red-mill-rum", value: "$1,500", slug: "red-mill-rum-tasting-and-tour-value-1500" },

  { title: "2 hour harbour cruise on Iluka", donor: "Iluka", image: "iluka-cruise", value: "$2,480", slug: "2-hour-harbour-cruise-on-iluka" },
  // Filename changed from verve-portraits on purpose. The crop was corrected
  // in place and browsers kept serving the old cached bytes off the unchanged
  // URL, so the fix looked like it had failed. A new filename is a new URL.
  { title: "Photoshoot", donor: "Verve", image: "verve-photoshoot", value: "$1,200", slug: "verve-photoshoot-value-1200" },
  { title: "Holiday camp sailing", donor: "Hunters Hill Sailing Club", image: "hunters-hill-sailing", value: "$740", slug: "hunters-hill-sailing-club-holiday-camp-sailing" },
  { title: "Intimates photoshoot", donor: "Verve Intimates", image: "verve-intimates", value: "$695", slug: "verve-intimates-photoshoot-value-695" },
  // A tall portrait on white, so this one is fitted whole rather than
  // cropped. See the note in the conversion of the source file.
  { title: "A4 custom watercolour, commissioned house portrait", donor: "Cindy Schuele", image: "cindy-schuele", value: "$500", slug: "a4-custom-watercolour-commissioned-house-portrait-by-artist-cindy-schuele" },

  // Moved down off the top spot on Gemma's instruction. Its $6,000 value is
  // still the highest on the page, so this position is deliberate and not a
  // sorting slip.
  //
  // Supplied as a square marketing tile with the wordmark across the top and
  // the partner logo row along the bottom, so it is fitted whole rather than
  // cropped: a 4:3 cover crop cut both off.
  { title: "Full day AI workshop for a sole trader or small business", donor: "Neoma", image: "neoma-ai-workshop", value: "$6,000", slug: "neoma-how-to-use-ai-workshop-6000-value" },
  // Air Auctioneer's value field reads $410 while the lot title rounds it to
  // $400. The field is the number they entered, so it is the one shown, same
  // as the District lamp where the title says "almost $250" and the field
  // says $219. Fitted whole: the headline and the "kindly donated by Balmain
  // Kidstuff" credit sit at the very top and bottom of the tile.
  { title: "Older kids toy bundle", donor: "Kidstuff Balmain", image: "kidstuff-older", value: "$410", slug: "kidstuff-older-kids-toy-bundle-400-value" },
  { title: "Wearable acupressure wristbands", donor: "Lükii", image: "lukii-bands", value: "$400", slug: "lukii-acupunture-bands-valued-at-400" },

  { title: "Pizza oven, starter kit and cover", donor: "Bunnings", image: "pizza-oven", value: "$375", slug: "bunnings-pizza-oven-starter-kit-and-cover" },
  { title: "3 months all access", donor: "Balmain Fitness", image: "balmain-fitness", value: "$450", slug: "3-months-all-access-balmain-fitness-450-value" },
  { title: "10 pack of pilates classes", donor: "Rituel Movement Rozelle", image: "rituel-movement", value: "$385", slug: "rituel-movement-rozelle-10-pack-pilates-classes-value-385" },
  { title: "$350 voucher", donor: "Dry Dock Hotel", image: "dry-dock", value: "$350", slug: "dry-dock-hotel-350-voucher" },
  { title: "A full term of lessons or a week of holiday camp", donor: "State Soccer", image: "state-soccer", value: "$300", slug: "state-soccer-holiday-camp-either-a-full-term-of-lessons-or-a-full-week-school-holiday-camp" },

  // Supplied as a square marketing tile rather than a photo, so it is
  // fitted whole onto a bone background rather than cropped: a 4:3 cover
  // crop cut through the DISTRICT wordmark at the top and the feature
  // icons at the bottom. bone is the card background, so the bars do not
  // read as letterboxing.
  { title: "Karl-Johan portable table lamp", donor: "District", image: "district-lamp", value: "$219", slug: "karl-johan-portable-table-lamp-valued-at-almost-250" },

  // Air Auctioneer has no value field on this one, unlike its older-kids
  // sibling. The $200 comes from the lot title and the lot description, which
  // both read $200, not from anywhere else.
  { title: "Younger kids toy bundle", donor: "Kidstuff Balmain", image: "kidstuff-younger", value: "$200", slug: "kidstuff-younger-kids-bundle-200-value" },

  { title: "$200 voucher", donor: "Walls Pharmacy", image: "walls-pharmacy", value: "$200", slug: "walls-pharmacy-200-voucher" },
  { title: "$200 gift voucher", donor: "Ingenia Holiday Park Soldiers Point", image: "ingenia-park", value: "$200", slug: "ingenia-holiday-park-soldiers-point-gift-voucher-200" },
  { title: "Kids party voucher", donor: "Vitaland", image: "vitaland", value: "$200", slug: "vitaland-kids-party-voucher-200-value" },
  { title: "$150 voucher", donor: "Bits of Australia", image: "bits-of-australia", value: "$150", slug: "bits-of-australia-150-voucher" },

  // Listed twice on Air Auctioneer, so shown twice here for the same reason.
  { title: "10 training sessions and 10 recovery sessions", donor: "Combine Air", image: "combine-air", value: "$350", note: "1 of 2", slug: "combine-air-10-training-sessions-10-x-recovery-sessions" },
  { title: "10 training sessions and 10 recovery sessions", donor: "Combine Air", image: "combine-air", value: "$350", note: "2 of 2", slug: "combine-air-10-x-training-sessions-and-10-x-recovery-sessions" },

  { title: "Family pass", donor: "Taronga Zoo", image: "taronga-zoo", value: "$158", slug: "taronga-zoo-family-pass" },
  // Their title really does read "2adults" with no space. Do not tidy it.
  { title: "Family pass, 2 adults and 2 children", donor: "Scenic World", image: "scenic-world", value: "$224", slug: "scenic-world-family-pass-2adults-2-children" },
  { title: "Afternoon Discovery Cruise for 2 adults", donor: "Sydney Harbour Tall Ships", image: "tall-ships", value: "$168", slug: "sydney-harbour-tall-ships-afternoon-discovery-cruise-for-2-adults" },
  { title: "Bathhouse experience", donor: "Nature's Energy", image: "natures-energy", value: "$59", slug: "natures-energy-bathhouse-experience" },
  { title: "Couples Flauna, float and sauna", donor: "City Cave", image: "city-cave", value: "$169", slug: "city-cave-couples-flauna-float-sauna" },
  // Sits mid-grid rather than last. Gemma's call: it is one of the lots
  // people actually talk about, and it was reading as an afterthought at the
  // bottom of 47 cards. At three columns this lands it in the middle column
  // of a row, so it is the card your eye goes to on the way down.
  //
  // No `value`. Air Auctioneer reads "Value: Priceless!", which is not a
  // number, so the card shows no valuation badge rather than the words
  // "Valued at Priceless".
  { title: "Principal for the day", donor: "Nicholson Street Public School", image: "principal-for-the-day", slug: "principal-for-the-day" },

  { title: "Unlimited rides pass x 4", donor: "Luna Park", image: "luna-park", value: "$200", slug: "unlimited-rides-pass-x-4" },
  { title: "2 day passes", donor: "Sydney Action Park, formerly Raging Waters", image: "sydney-action-park", value: "$169", slug: "sydney-action-park-frmly-raging-waters-2x-day-passes" },
  { title: "Family pass", donor: "Sydney Kings and Sydney Flames", image: "sydney-kings", value: "$165", slug: "family-pass-to-sydney-kings-sydney-flames" },
  { title: "Family pass", donor: "Sydney Indoor Climbing Centre", image: "climbing-centre", value: "$100", slug: "sydney-indoor-climbing-centre-family-pass" },
  { title: "Ground tour", donor: "Sydney Cricket Ground", image: "scg-tours", value: "$100", slug: "sydney-cricket-ground-scg-tours" },

  // Four separate vouchers, four separate lots, four separate bids. $1,000 of
  // East Village Hotel in total. Each card links to its own lot.
  //
  // Split into two pairs, here and further down, rather than four in a row.
  // Gemma's call: four identical cards together read as one lot repeated.
  // The "of 4" notes matter more now they are apart, so keep them.
  { title: "$250 voucher", donor: "East Village Hotel", image: "evh", value: "$250", note: "1 of 4", slug: "east-village-hotel-evh-250-voucher" },
  { title: "$250 voucher", donor: "East Village Hotel", image: "evh", value: "$250", note: "2 of 4", slug: "east-village-hotel-evh-250-voucher-2" },

  { title: "3 day holiday camp", donor: "Balmain District Football Club", image: "balmain-fc", value: "$270", slug: "balmain-district-football-club-3-day-holiday-camp" },
  { title: "Holiday camp, 3 day pass", donor: "Sydney Uni Sports", image: "sydney-uni-sports", value: "$235", slug: "sydney-uni-sports-holiday-camp-3-day-pass" },
  { title: "$100 voucher", donor: "Hyperkarting", image: "hyperkarting", value: "$100", slug: "hyperkarting-100-voucher" },
  { title: "Holiday art classes", donor: "Paper, Rock, Scissors", image: "paper-rock-scissors", value: "$165", slug: "paper-rock-scissors-holiday-art-classes" },
  { title: "6 pack of assorted wines", donor: "DRNKS", image: "drnks", value: "$150", slug: "6pk-assorted-wines-from-drnks" },
  { title: "$150 voucher", donor: "The Cricketers Balmain", image: "cricketers-pub", value: "$150", slug: "cricketers-balmain-150-voucher" },
  // Air Auctioneer's value field says $150 but the lot is titled "$100
  // voucher". $100 is used so the card matches what a bidder reads when
  // they click through, same call as Soya Cafe. Worth correcting there.
  { title: "$100 voucher", donor: "The Cricketers Balmain", image: "cricketers-burger", value: "$100", slug: "the-cricketers-balmain-100-voucher" },
  // Two separate $100 vouchers, so two cards. This pair was the lot missing
  // from the first pass, which is why the page showed 33 of Air Auctioneer's
  // 34. Each gets its own photo rather than the same one twice.
  { title: "$100 voucher", donor: "Eat at Robs", image: "eat-at-robs-signs", value: "$100", note: "1 of 2", slug: "eat-at-robs-x-100-voucher" },
  { title: "$100 voucher", donor: "Eat at Robs", image: "eat-at-robs-burgers", value: "$100", note: "2 of 2", slug: "eat-at-robs-x-100-voucher-2" },
  { title: "$100 voucher", donor: "Eden Pasticceria Five Dock", image: "eden-pasticceria", value: "$100", slug: "eden-pasticceria-five-dock-100-voucher" },
  { title: "$100 voucher", donor: "Hill of Content", image: "hill-of-content", value: "$100", slug: "hill-of-content-100-voucher" },
  { title: "$100 voucher", donor: "Big Tree House Cafe Balmain", image: "big-tree-house", value: "$100", slug: "big-tree-house-cafe-in-balmain-100-voucher" },
  { title: "$100 voucher", donor: "Cici Italian Wine Bar", image: "cici", value: "$100", slug: "cici-italian-wine-bar-100-voucher" },
  // Air Auctioneer has no value line for this one. The $100 is the
  // voucher's face value, taken from the lot title, not invented.
  { title: "$100 voucher", donor: "Pepperwhites Balmain", image: "pepperwhites", value: "$100", slug: "pepperwhites-balmain-100-voucher" },

  // The other two East Village Hotel vouchers. See the note on the first pair.
  { title: "$250 voucher", donor: "East Village Hotel", image: "evh", value: "$250", note: "3 of 4", slug: "east-village-hotel-evh-250-voucher-3" },
  { title: "$250 voucher", donor: "East Village Hotel", image: "evh", value: "$250", note: "4 of 4", slug: "east-village-hotel-evh-250-voucher-4" },

  { title: "Healthfoods voucher", donor: "The Source Bulk Foods Balmain", image: "the-source", value: "$100", slug: "the-source-healthfoods-balmain" },
  { title: "$70 voucher", donor: "TJ's Quality Meats Balmain", image: "tjs-meats", value: "$70", slug: "tjs-quality-meats-balmain-70-voucher" },
  { title: "$50 voucher", donor: "Nature Baby Balmain", image: "nature-baby", value: "$50", slug: "nature-baby-balmain-50-voucher" },
  { title: "$50 voucher", donor: "Roaring Stories", image: "roaring-stories", value: "$50", slug: "roaring-stories-50-voucher" },
  { title: "$50 voucher", donor: "Maloneys Grocer Rozelle", image: "maloneys", value: "$50", slug: "maloneys-voucher-50" },
  // Air Auctioneer's value field says $150 but the lot is titled "$50
  // voucher". $50 is used, so the card matches what a bidder reads when
  // they click through. Worth correcting over there either way.
  { title: "$50 voucher", donor: "Soya Cafe Balmain", image: "soya-cafe", value: "$50", slug: "soya-cafe-balmain-50-voucher" },
  { title: "Full body massage and 2 gift bags of scalp care", donor: "Scalp Spa", image: "scalp-spa", value: "$200", slug: "scalp-spa-full-body-massage-2-gift-bags-of-scalp-care" },
  { title: "Bespoke facial", donor: "Suede Clinic", image: "suede-clinic", value: "$250", slug: "suede-clinic-bespoke-facial" },
  { title: "Yoga and pilates gift certificate", donor: "Soul Agenda", image: "soul-agenda", value: "$250", slug: "soul-agenda-yoga-pilates-gift-certificate" },
  { title: "2 luxurious candles and a $25 voucher", donor: "House of SNJ Candles", image: "snj-candles", value: "$150", slug: "house-of-snj-candles-2-luxurious-candles-and-25-voucher" },
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
            {/* One heading, set on two lines. The sponsor name sits smaller
                above so "Silent Auction" keeps the display size it had, and
                the whole thing stays a single h1 for screen readers. */}
            <h1 className="font-display font-bold text-bone mb-4 tracking-tight leading-none">
              <span className="block text-3xl md:text-4xl text-paper/80 mb-2">
                Bresic Whitney&apos;s
              </span>
              <span className="block text-6xl md:text-7xl">Silent Auction</span>
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
        {/* Heading left, sponsor right. items-end sits the logo on the same
            baseline as the last line of the intro copy, so it reads as part of
            the section rather than dropped on top of it. Stacks on mobile,
            where there is no room for two columns. */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 mb-12">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-rust-deep mb-4">
              What&apos;s up for grabs
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-ink mb-6 leading-tight">
              This year&apos;s lots
            </h2>
            <p className="font-body text-lg text-ink-soft">
              Local businesses have been extraordinarily generous. Have a look
              at what is on offer, then head to Air Auctioneer to place your
              bid.
            </p>
          </div>

          {/* Bresic Whitney sponsor the auction for 2026. They are still
              listed as gold on /sponsors: this is in addition to that, not
              instead of it.

              The logo is supplied as a JPEG with white baked in, so it sits on
              a white plate. Same reasoning as the sponsor wall: the plate
              matches the logo's own background, otherwise you get a white
              rectangle inside a cream one.

              object-cover in a 4:1 box crops the empty canvas above and below
              the wordmark, which only fills about the middle sixth of the
              square file. object-contain would fit the whitespace instead and
              the mark would come out roughly 10px tall. If the logo file is
              ever replaced, re-check this crop. */}
          <div className="md:shrink-0 md:text-right">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-moss mb-3">
              Proudly sponsored by
            </p>
            <a
              href="https://bresicwhitney.com.au/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit the Bresic Whitney website, opens in a new tab"
              className="inline-block bg-white px-5 py-3 shadow-[0_2px_20px_rgba(184,92,46,0.22)] hover:shadow-[0_8px_34px_rgba(184,92,46,0.45)] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rust focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              <Image
                src="/images/sponsor-logos/bresic-whitney.jpg"
                alt="Bresic Whitney"
                width={900}
                height={900}
                className="w-[150px] md:w-[180px] aspect-[4/1] object-cover"
              />
            </a>
          </div>
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
