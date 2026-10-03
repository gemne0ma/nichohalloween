import Image from "next/image";

export const metadata = {
  title: "Bresic Whitney's Silent Auction . Nicho Halloween Festival",
};

// Bidding happens on Air Auctioneer, not here. This page is a showcase so
// people can see what is up for grabs without creating an account first, and
// every route to actually bidding goes to the same URL.
const AIR_AUCTIONEER =
  "https://airauctioneer.com/nicholson-street-ps-halloween-festival-silent-auction";

// Mirrored from the Air Auctioneer catalogue. Last full resync 3 October 2026,
// when the catalogue went to 97 lots and every lot was given new artwork.
// THIS LIST DOES NOT SYNC. If a lot is added, withdrawn, renamed or revalued
// over there, this page keeps showing the old version until someone edits it.
//
// Renaming a lot on Air Auctioneer changes its slug, and a dead slug does not
// error: the site answers 200 and quietly renders the catalogue instead, so a
// stale link silently dumps bidders on the full list. That has happened in
// bulk twice. Before the festival, re-check every slug by fetching it and
// confirming the lot's own name comes back in the <title>, not the auction
// name. A status code proves nothing.
//
// `image` points into public/images/auction/aa/, which holds the artwork
// pulled from Air Auctioneer itself, one file per lot named after its slug.
// Those tiles are square and carry the lot's value burned into the artwork,
// which is why the card renders them square and no longer draws its own
// "Valued at" badge over the top. `value` is still recorded here because it
// is what the running total is counted from, it is just not drawn twice.

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
  { title: "Rum tasting and distillery tour", donor: "Red Mill Distillery", image: "aa/red-mill-rum-private-tasting-and-behind-the-scenes-tour-for-up-to-12-people-value-1500", value: "$1,500", slug: "red-mill-rum-private-tasting-and-behind-the-scenes-tour-for-up-to-12-people-value-1500" },
  { title: "2 hour harbour cruise on Iluka", donor: "Iluka", image: "aa/2-hour-harbour-cruise-on-iluka-value-2480", value: "$2,480", slug: "2-hour-harbour-cruise-on-iluka-value-2480" },
  { title: "Rock Lobster, an original artwork", donor: "Lara Scolari", image: "aa/rock-lobster-by-local-artist-lara-scolari-value-1290", value: "$1,290", slug: "rock-lobster-by-local-artist-lara-scolari-value-1290" },
  { title: "Photoshoot", donor: "Verve", image: "aa/verve-photoshoot-value-1200", value: "$1,200", slug: "verve-photoshoot-value-1200" },
  { title: "Holiday camp sailing", donor: "Hunters Hill Sailing Club", image: "aa/hunters-hill-sailing-club-up-to-5-day-holiday-camp-experience-value-740", value: "$740", slug: "hunters-hill-sailing-club-up-to-5-day-holiday-camp-experience-value-740" },
  { title: "Intimates photoshoot", donor: "Verve Intimates", image: "aa/verve-intimates-photoshoot-value-695", value: "$695", slug: "verve-intimates-photoshoot-value-695" },
  { title: "Private walking tour of Sydney's cultural and historic heart, up to 6 people", donor: "Sabrina Mondschein", image: "aa/private-walking-tour-sydneys-cultural-historic-heart-for-up-to-6-people-value-660", value: "$660", slug: "private-walking-tour-sydneys-cultural-historic-heart-for-up-to-6-people-value-660" },
  { title: "A4 custom watercolour, commissioned house portrait", donor: "Cindy Schuele", image: "aa/custom-commissioned-watercolour-house-or-architectural-portrait-by-artist-cindy-scheule-value-550", value: "$550", slug: "custom-commissioned-watercolour-house-or-architectural-portrait-by-artist-cindy-scheule-value-550" },
  { title: "Full day AI workshop for a sole trader or small business", donor: "Neoma", image: "aa/neoma-how-to-use-ai-workshop-6000-value", value: "$6,000", slug: "neoma-how-to-use-ai-workshop-6000-value" },
  { title: "4 hours of carpentry", donor: "APX Build", image: "aa/handy-home-help-4-hours-of-carpentry-from-apx-build-value-550", value: "$550", slug: "handy-home-help-4-hours-of-carpentry-from-apx-build-value-550" },
  { title: "Personalised styling and bra fitting, a $250 credit and a gift bag", donor: "Intimo", image: "aa/intimo-personalised-styling-and-bra-fitting-session-250-credit-and-gift-bag-value-500", value: "$500", slug: "intimo-personalised-styling-and-bra-fitting-session-250-credit-and-gift-bag-value-500" },
  { title: "Older kids toy bundle", donor: "Kidstuff Balmain", image: "aa/kidstuff-older-kids-toy-bundle-400-value", value: "$400", slug: "kidstuff-older-kids-toy-bundle-400-value" },
  { title: "Private lesson for four people", donor: "Mahjong Club Sydney", image: "aa/private-mahjong-lesson-for-four-people-valued-at-400", value: "$400", slug: "private-mahjong-lesson-for-four-people-valued-at-400" },
  { title: "Voucher for small group classes and personal training", donor: "FIT Reflection", image: "aa/fit-reflection-365-voucher-for-small-group-classes-and-personal-training", value: "$365", note: "1 of 2", slug: "fit-reflection-365-voucher-for-small-group-classes-and-personal-training" },
  { title: "Voucher for small group classes and personal training", donor: "FIT Reflection", image: "aa/fit-reflection-365-voucher-for-small-group-classes-and-personal-training-2", value: "$365", note: "2 of 2", slug: "fit-reflection-365-voucher-for-small-group-classes-and-personal-training-2" },
  { title: "Wearable acupressure wristbands", donor: "Lükii", image: "aa/lukii-acupunture-bands-valued-at-350", value: "$350", note: "1 of 2", slug: "lukii-acupunture-bands-valued-at-350" },
  { title: "Wearable acupressure wristbands", donor: "Lükii", image: "aa/lukii-accupunture-bands-valued-at-350", value: "$350", note: "2 of 2", slug: "lukii-accupunture-bands-valued-at-350" },
  { title: "Pamper and health bundle", donor: "The Well Store Rozelle", image: "aa/the-well-store-bundle-valued-at-350-value", value: "$350", slug: "the-well-store-bundle-valued-at-350-value" },
  { title: "Cozze pizza oven, starter kit and cover", donor: "Bunnings Rozelle", image: "aa/cozze-pizza-oven-starter-kit-and-cover-value-375", value: "$375", slug: "cozze-pizza-oven-starter-kit-and-cover-value-375" },
  { title: "3 months all access", donor: "Balmain Fitness", image: "aa/balmain-fitness-3-months-full-access-membership-450-value", value: "$450", slug: "balmain-fitness-3-months-full-access-membership-450-value" },
  { title: "10 pack of pilates classes", donor: "Rituel Movement Rozelle", image: "aa/rituel-movement-rozelle-10-pack-pilates-classes-value-385", value: "$385", slug: "rituel-movement-rozelle-10-pack-pilates-classes-value-385" },
  { title: "$300 voucher for hand woven Panama hats", donor: "Camilo Hats", image: "aa/camilo-hats-hand-woven-panama-hats-300-voucher", value: "$300", note: "1 of 2", slug: "camilo-hats-hand-woven-panama-hats-300-voucher" },
  { title: "$300 voucher for hand woven Panama hats", donor: "Camilo Hats", image: "aa/camilo-hats-hand-woven-panama-hats-300-voucher-2", value: "$300", note: "2 of 2", slug: "camilo-hats-hand-woven-panama-hats-300-voucher-2" },
  { title: "5 pack of group classes", donor: "The Studio", image: "aa/the-studio-5-pack-of-group-classes-value-205", value: "$205", slug: "the-studio-5-pack-of-group-classes-value-205" },
  { title: "$200 voucher", donor: "Punch Gallery", image: "aa/punch-gallery-200-voucher", value: "$200", slug: "punch-gallery-200-voucher" },
  { title: "Wine hamper with a shiraz, a pourer and 2 Good Food and Wine Show tickets", donor: "Vin Culture", image: "aa/ultimate-wine-hamper-shiraz-wine-poureraerator-and-2-tickets-to-the-good-food-and-wine-show-value", value: "$170", slug: "ultimate-wine-hamper-shiraz-wine-poureraerator-and-2-tickets-to-the-good-food-and-wine-show-value" },
  { title: "1 day holiday camp voucher", donor: "Le Ray Gymnastics", image: "aa/le-ray-gymnastics-1-day-holiday-camp-voucher-value-120", value: "$120", note: "1 of 2", slug: "le-ray-gymnastics-1-day-holiday-camp-voucher-value-120" },
  { title: "1 day holiday camp voucher", donor: "Le Ray Gymnastics", image: "aa/le-ray-gymnastics-1-day-holiday-camp-voucher-value-120-2", value: "$120", note: "2 of 2", slug: "le-ray-gymnastics-1-day-holiday-camp-voucher-value-120-2" },
  { title: "Blowdry, cut and deluxe treatment", donor: "Smith and Queen Salon", image: "aa/smith-and-queen-salon-blowdry-cut-deluxe-treatment-220-value", value: "$220", slug: "smith-and-queen-salon-blowdry-cut-deluxe-treatment-220-value" },
  { title: "$350 voucher", donor: "Dry Dock Hotel", image: "aa/dry-dock-hotel-350-voucher", value: "$350", slug: "dry-dock-hotel-350-voucher" },
  { title: "A full term of lessons or a week of holiday camp", donor: "State Soccer", image: "aa/state-soccer-either-a-full-term-of-lessons-or-a-full-week-school-holiday-camp-valued-at-300", value: "$300", note: "1 of 2", slug: "state-soccer-either-a-full-term-of-lessons-or-a-full-week-school-holiday-camp-valued-at-300" },
  { title: "A full term of lessons or a week of holiday camp", donor: "State Soccer", image: "aa/state-soccer-either-a-full-term-of-lessons-or-a-full-week-school-holiday-camp-valued-at-300-2", value: "$300", note: "2 of 2", slug: "state-soccer-either-a-full-term-of-lessons-or-a-full-week-school-holiday-camp-valued-at-300-2" },
  { title: "2026 signed NRLW away jersey", donor: "Wests Tigers", image: "aa/2026-wests-tigers-nrlw-signed-away-jersey-value-300", value: "$300", slug: "2026-wests-tigers-nrlw-signed-away-jersey-value-300" },
  { title: "Karl-Johan portable table lamp", donor: "District", image: "aa/karl-johan-portable-table-lamp-valued-at-219", value: "$219", slug: "karl-johan-portable-table-lamp-valued-at-219" },
  { title: "Younger kids toy bundle", donor: "Kidstuff Balmain", image: "aa/kidstuff-younger-kids-bundle-200-value", value: "$200", slug: "kidstuff-younger-kids-bundle-200-value" },
  { title: "$200 voucher", donor: "Walls Pharmacy", image: "aa/walls-pharmacy-200-voucher", value: "$200", slug: "walls-pharmacy-200-voucher" },
  { title: "$200 voucher", donor: "Ingenia Holiday Parks", image: "aa/ingenia-holiday-park-200-voucher", value: "$200", slug: "ingenia-holiday-park-200-voucher" },
  { title: "Kids party voucher", donor: "Vitaland", image: "aa/vitaland-kids-party-voucher-200-value", value: "$200", slug: "vitaland-kids-party-voucher-200-value" },
  { title: "Family pass", donor: "Australian Reptile Park", image: "aa/australian-reptile-park-family-pass-value-155", value: "$155", slug: "australian-reptile-park-family-pass-value-155" },
  { title: "$150 voucher", donor: "Bits of Australia", image: "aa/bits-of-australia-150-voucher", value: "$150", slug: "bits-of-australia-150-voucher" },
  { title: "10 training sessions and 10 recovery sessions", donor: "Combine Air", image: "aa/combine-air-10-training-sessions-10-x-recovery-sessions-value-350", value: "$350", note: "1 of 2", slug: "combine-air-10-training-sessions-10-x-recovery-sessions-value-350" },
  { title: "10 training sessions and 10 recovery sessions", donor: "Combine Air", image: "aa/combine-air-10-x-training-sessions-and-10-x-recovery-sessions-value-350", value: "$350", note: "2 of 2", slug: "combine-air-10-x-training-sessions-and-10-x-recovery-sessions-value-350" },
  { title: "Family pass", donor: "Taronga Zoo", image: "aa/taronga-zoo-family-pass-value-158", value: "$158", slug: "taronga-zoo-family-pass-value-158" },
  { title: "Family pass, 2 adults and 2 children", donor: "Scenic World", image: "aa/scenic-world-family-pass-value-224", value: "$224", slug: "scenic-world-family-pass-value-224" },
  { title: "Afternoon Discovery Cruise for 2 adults", donor: "Sydney Harbour Tall Ships", image: "aa/sydney-harbour-tall-ships-afternoon-discovery-cruise-for-2-adults-value-168", value: "$168", slug: "sydney-harbour-tall-ships-afternoon-discovery-cruise-for-2-adults-value-168" },
  { title: "Laphroaig 10 year old single malt scotch whisky, 700ml", donor: "Donated by a Nicho family", image: "aa/laphroaig-10-year-old-single-malt-scotch-whisky-700ml-value-120", value: "$120", slug: "laphroaig-10-year-old-single-malt-scotch-whisky-700ml-value-120" },
  { title: "3 pack of Head Wines", donor: "The Ruggles and Rahmani family", image: "aa/3-pack-of-head-wines-value-110", value: "$110", slug: "3-pack-of-head-wines-value-110" },
  { title: "2 magnums of Robert Oatley cabernet sauvignon", donor: "Balmain Wine Shop", image: "aa/2-magnums-of-robert-oatley-cab-sav-value-100", value: "$100", slug: "2-magnums-of-robert-oatley-cab-sav-value-100" },
  { title: "Bathhouse experience", donor: "Nature's Energy", image: "aa/natures-energy-bathhouse-experience-value-59", value: "$59", slug: "natures-energy-bathhouse-experience-value-59" },
  { title: "Couples Flauna, float and sauna", donor: "City Cave", image: "aa/city-cave-couples-flauna-float-sauna-value-169", value: "$169", slug: "city-cave-couples-flauna-float-sauna-value-169" },
  { title: "$50 voucher", donor: "Artspark", image: "aa/artspark-50-voucher", value: "$50", note: "1 of 2", slug: "artspark-50-voucher" },
  { title: "$50 voucher", donor: "Artspark", image: "aa/artspark-50-voucher-2", value: "$50", note: "2 of 2", slug: "artspark-50-voucher-2" },
  { title: "Principal for the day", donor: "Nicholson Street Public School", image: "aa/principal-for-the-day-priceless", slug: "principal-for-the-day-priceless" },
  { title: "A pizza party for your class", donor: "Domino's", image: "aa/win-a-pizza-party-for-your-class-priceless", slug: "win-a-pizza-party-for-your-class-priceless" },
  { title: "Unlimited rides pass for 4 people", donor: "Luna Park", image: "aa/luna-park-unlimited-rides-pass-for-4-people-value-176", value: "$176", slug: "luna-park-unlimited-rides-pass-for-4-people-value-176" },
  { title: "2 day passes", donor: "Sydney Action Park, formerly Raging Waters", image: "aa/sydney-action-park-frmly-raging-waters-2-x-day-passes-value-168", value: "$168", slug: "sydney-action-park-frmly-raging-waters-2-x-day-passes-value-168" },
  { title: "Family pass", donor: "Sydney Kings and Sydney Flames", image: "aa/family-pass-to-sydney-kings-sydney-flames-value-165", value: "$165", slug: "family-pass-to-sydney-kings-sydney-flames-value-165" },
  { title: "Family pass", donor: "Sydney Indoor Climbing Centre", image: "aa/sydney-indoor-climbing-centre-family-pass-value-97", value: "$97", slug: "sydney-indoor-climbing-centre-family-pass-value-97" },
  { title: "Guided walking tour", donor: "Sydney Cricket Ground", image: "aa/sydney-cricket-ground-scg-guided-walking-tour-100-voucher", value: "$100", slug: "sydney-cricket-ground-scg-guided-walking-tour-100-voucher" },
  { title: "$250 voucher", donor: "East Village Hotel", image: "aa/east-village-hotel-evh-250-voucher", value: "$250", note: "1 of 4", slug: "east-village-hotel-evh-250-voucher" },
  { title: "$250 voucher", donor: "East Village Hotel", image: "aa/east-village-hotel-evh-250-voucher-2", value: "$250", note: "2 of 4", slug: "east-village-hotel-evh-250-voucher-2" },
  { title: "3 day holiday camp", donor: "Balmain District Football Club", image: "aa/balmain-district-football-club-3-day-holiday-camp-value-270", value: "$270", slug: "balmain-district-football-club-3-day-holiday-camp-value-270" },
  { title: "3 day holiday camp", donor: "Sydney Uni Sports", image: "aa/sydney-uni-sports-3-day-holiday-camp-value-235", value: "$235", slug: "sydney-uni-sports-3-day-holiday-camp-value-235" },
  { title: "$100 voucher", donor: "Hyperkarting", image: "aa/hyperkarting-100-voucher", value: "$100", slug: "hyperkarting-100-voucher" },
  { title: "Half day holiday art class", donor: "Paper, Rock, Scissors", image: "aa/paper-rock-scissors-half-day-holiday-art-class-value-8250", value: "$82.50", note: "1 of 2", slug: "paper-rock-scissors-half-day-holiday-art-class-value-8250" },
  { title: "Half day holiday art class", donor: "Paper, Rock, Scissors", image: "aa/paper-rock-scissors-half-day-holiday-art-class-value-8250-2", value: "$82.50", note: "2 of 2", slug: "paper-rock-scissors-half-day-holiday-art-class-value-8250-2" },
  { title: "6 pack of assorted wines", donor: "DRNKS", image: "aa/6pk-assorted-wines-from-drnks-value-150", value: "$150", slug: "6pk-assorted-wines-from-drnks-value-150" },
  { title: "$150 voucher", donor: "The Cricketers Balmain", image: "aa/the-cricketers-balmain-150-voucher", value: "$150", slug: "the-cricketers-balmain-150-voucher" },
  { title: "$50 voucher", donor: "Fruitologist Rozelle", image: "aa/fruitologist-rozelle-50-voucher", value: "$50", slug: "fruitologist-rozelle-50-voucher" },
  { title: "$100 voucher", donor: "Fruitologist Rozelle", image: "aa/fruitologist-rozelle-100-voucher", value: "$100", slug: "fruitologist-rozelle-100-voucher" },
  { title: "School holiday camp voucher", donor: "Beyond the Bell", image: "aa/beyond-the-bell-school-holiday-camps-150-voucher", value: "$150", slug: "beyond-the-bell-school-holiday-camps-150-voucher" },
  { title: "$100 voucher", donor: "The Cricketers Balmain", image: "aa/the-cricketers-balmain-100-voucher", value: "$100", slug: "the-cricketers-balmain-100-voucher" },
  { title: "$100 voucher", donor: "Eat at Robs", image: "aa/eat-at-robs-x-100-voucher", value: "$100", note: "1 of 2", slug: "eat-at-robs-x-100-voucher" },
  { title: "$100 voucher", donor: "Eat at Robs", image: "aa/eat-at-robs-x-100-voucher-2", value: "$100", note: "2 of 2", slug: "eat-at-robs-x-100-voucher-2" },
  { title: "$100 voucher", donor: "Eden Pasticceria Five Dock", image: "aa/eden-pasticceria-five-dock-100-voucher", value: "$100", slug: "eden-pasticceria-five-dock-100-voucher" },
  { title: "$100 voucher", donor: "Hill of Content", image: "aa/hill-of-content-100-voucher", value: "$100", slug: "hill-of-content-100-voucher" },
  { title: "$100 voucher", donor: "Darling Street Meats", image: "aa/darling-street-meats-100-voucher", value: "$100", note: "1 of 2", slug: "darling-street-meats-100-voucher" },
  { title: "$100 voucher", donor: "Darling Street Meats", image: "aa/darling-street-meats-100-voucher-2", value: "$100", note: "2 of 2", slug: "darling-street-meats-100-voucher-2" },
  { title: "$100 voucher", donor: "Big Tree House Cafe Balmain", image: "aa/big-tree-house-cafe-in-balmain-100-voucher", value: "$100", slug: "big-tree-house-cafe-in-balmain-100-voucher" },
  { title: "$100 voucher", donor: "Cicci Italian Wine Bar", image: "aa/cicci-italian-wine-bar-100-voucher", value: "$100", slug: "cicci-italian-wine-bar-100-voucher" },
  { title: "$100 voucher", donor: "Pepperwhites Balmain", image: "aa/pepperwhites-balmain-100-voucher", value: "$100", slug: "pepperwhites-balmain-100-voucher" },
  { title: "$250 voucher", donor: "East Village Hotel", image: "aa/east-village-hotel-evh-250-voucher-3", value: "$250", note: "3 of 4", slug: "east-village-hotel-evh-250-voucher-3" },
  { title: "$250 voucher", donor: "East Village Hotel", image: "aa/east-village-hotel-evh-250-voucher-4", value: "$250", note: "4 of 4", slug: "east-village-hotel-evh-250-voucher-4" },
  { title: "Healthfoods voucher", donor: "The Source Bulk Foods Balmain", image: "aa/the-source-healthfoods-balmain-100-voucher", value: "$100", slug: "the-source-healthfoods-balmain-100-voucher" },
  { title: "$70 voucher", donor: "TJ's Quality Meats Balmain", image: "aa/tjs-quality-meats-balmain-70-voucher", value: "$70", slug: "tjs-quality-meats-balmain-70-voucher" },
  { title: "Junior racket and a set of balls", donor: "Leichhardt Tennis Academy", image: "aa/junior-tennis-racket-and-set-of-balls-valued-at-60", value: "$60", slug: "junior-tennis-racket-and-set-of-balls-valued-at-60" },
  { title: "$50 voucher", donor: "Nature Baby Balmain", image: "aa/nature-baby-balmain-50-voucher", value: "$50", slug: "nature-baby-balmain-50-voucher" },
  { title: "$50 voucher", donor: "Atom Thai", image: "aa/atom-thai-50-voucher", value: "$50", slug: "atom-thai-50-voucher" },
  { title: "$50 voucher", donor: "Roaring Stories", image: "aa/roaring-stories-50-voucher", value: "$50", slug: "roaring-stories-50-voucher" },
  { title: "$50 voucher", donor: "Maloneys Grocer Rozelle", image: "aa/maloneys-grocer-50-voucher", value: "$50", slug: "maloneys-grocer-50-voucher" },
  { title: "$50 voucher", donor: "Soya Cafe Balmain", image: "aa/soya-cafe-balmain-50-voucher", value: "$50", slug: "soya-cafe-balmain-50-voucher" },
  { title: "Full body massage and a scalp care gift bag", donor: "Scalp Spa", image: "aa/scalp-spa-full-body-massage-scalp-care-gift-bag-value-230", value: "$230", slug: "scalp-spa-full-body-massage-scalp-care-gift-bag-value-230" },
  { title: "Scalp care gift bag", donor: "Scalp Spa", image: "aa/scalp-spa-scalp-care-gift-bag-value-70", value: "$70", slug: "scalp-spa-scalp-care-gift-bag-value-70" },
  { title: "Bespoke facial", donor: "Suede Clinic", image: "aa/suede-clinic-bespoke-facial-value-250", value: "$250", slug: "suede-clinic-bespoke-facial-value-250" },
  { title: "Hamper", donor: "QE Food Stores Balmain", image: "aa/qe-foods-hamper-valued-at-250", value: "$250", slug: "qe-foods-hamper-valued-at-250" },
  { title: "Yoga and pilates gift certificate", donor: "Soul Agenda", image: "aa/soul-agenda-yoga-pilates-gift-certificate-value-250", value: "$250", slug: "soul-agenda-yoga-pilates-gift-certificate-value-250" },
  { title: "2 luxurious candles and a $20 voucher", donor: "House of SNJ Candles", image: "aa/house-of-snj-candles-2-luxurious-candles-and-20-voucher-value-150", value: "$150", slug: "house-of-snj-candles-2-luxurious-candles-and-20-voucher-value-150" },
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
              <Image
                src={`/images/auction/${lot.image}.webp`}
                alt={`${lot.donor}, ${lot.title}`}
                width={760}
                height={760}
                className="w-full aspect-square object-cover"
              />

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
