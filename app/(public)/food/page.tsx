import Image from "next/image";

export const metadata = {
  title: "Food and Drink . Nicho Halloween Festival",
};

// Rocket Boy supplied three files: two pizzas and his brand logo. The logo is
// treated as a logo rather than a photograph. It arrives on white, so it sits
// on a white plate for the same reason the sponsor logos do, otherwise you get
// a white rectangle inside a cream card.
const ROCKET_BOY = {
  logo: "/images/food/rocketboy-logo.webp",
  photos: [
    {
      src: "/images/food/rocketboy-pizza-1.webp",
      alt: "Salami and rocket pizza from Rocket Boy",
    },
    {
      src: "/images/food/rocketboy-pizza-2.webp",
      alt: "The Smokey Chick pizza from Rocket Boy",
    },
  ],
};

// No token prices anywhere on this page, on purpose. They are not set yet and
// a wrong number on a food stall is the kind of thing a parent queues for and
// then argues about. Add them here when they are confirmed, as a `meta` line
// on each item, matching the pattern on /attractions.
type Item = {
  name: string;
  desc?: string;
  image?: string;
  // A second photo, laid over the corner of the first as a small tilted
  // polaroid. The site already leans on tilted bone-framed photos (the
  // homepage ghosts, the attractions and sponsors polaroids), so this reads
  // as the same vocabulary rather than a new idea. It sits inside the photo
  // rather than overhanging it, because the card clips its own overflow.
  inset?: string;
  insetAlt?: string;
};

// Every photo is 4:3 at 760px wide or smaller, centre-cropped on conversion,
// so the cards line up without object-position tweaking per image.
const KITCHEN: Item[] = [
  {
    name: "Sausage sizzle",
    desc: "The one that never changes. Onions optional, sauce compulsory.",
    image: "/images/food/sausage-sizzle.webp",
  },
  {
    name: "American nachos",
    desc: "Corn chips under a proper amount of melted cheese.",
    image: "/images/food/nachos.webp",
    inset: "/images/food/nachos-tray.webp",
    insetAlt: "A tray of corn chips",
  },
];

const SWEETS: Item[] = [
  { name: "Fairy floss", image: "/images/food/fairy-floss.webp" },
  { name: "Snow cones", image: "/images/food/snow-cones.webp" },
  { name: "Popcorn", image: "/images/food/popcorn.webp" },
  { name: "Gelato", image: "/images/food/gelato.webp" },
];

const CAKE_STALL: Item[] = [
  { name: "Toffee apples", image: "/images/food/toffee-apples.webp" },
  { name: "Chocolate crackles", image: "/images/food/chocolate-crackles.webp" },
  { name: "Rocky road", image: "/images/food/rocky-road.webp" },
  { name: "Coconut ice", image: "/images/food/coconut-ice.webp" },
  { name: "Jam drops", image: "/images/food/jam-drops.webp" },
  { name: "Lamingtons", image: "/images/food/lamingtons.webp" },
  { name: "Fudge", image: "/images/food/fudge.webp" },
];

function ItemCard({ item, size = "md" }: { item: Item; size?: "sm" | "md" }) {
  return (
    <div className="bg-bone border-t-4 border-rust shadow-[0_2px_12px_rgba(26,26,26,0.12)] hover:shadow-[0_4px_20px_rgba(26,26,26,0.18)] hover:-translate-y-1 transition-all overflow-hidden flex flex-col">
      {item.image && (
        <div className="relative">
          <Image
            src={item.image}
            alt={item.name}
            width={760}
            height={570}
            className="w-full aspect-[4/3] object-cover"
          />

          {item.inset && (
            // Bottom right. The melted cheese in the main shot sits left of
            // centre and is the whole point of that photograph, so the inset
            // goes on the side that is only chips. Tilted the opposite way to
            // the attractions polaroid so the two do not read as a repeated
            // component.
            <div className="absolute bottom-3 right-3 w-[38%] max-w-[150px] rotate-[5deg] bg-bone p-1.5 pb-4 shadow-[-3px_5px_14px_rgba(26,26,26,0.35)]">
              <Image
                src={item.inset}
                alt={item.insetAlt ?? ""}
                width={420}
                height={315}
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
          )}
        </div>
      )}
      <div className={size === "sm" ? "p-5 md:p-6" : "p-6 md:p-7"}>
        <h3
          className={`font-display text-ink tracking-wide leading-tight ${
            size === "sm" ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"
          }`}
        >
          {item.name}
        </h3>
        {item.desc && (
          <p className="font-body text-base text-ink-soft leading-relaxed mt-3">
            {item.desc}
          </p>
        )}
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-rust-deep whitespace-nowrap">
        {children}
      </p>
      <span className="h-px bg-mist flex-1" aria-hidden />
    </div>
  );
}

export default function FoodPage() {
  return (
    <main className="min-h-screen bg-paper">
      {/* Dark hero band. Same construction as /auction, which is the pattern
          used when a page has no photograph big enough to carry a hero. */}
      <div className="bg-forest-deep">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-14 md:py-20">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-pumpkin mb-3">
            Come hungry
          </p>
          <h1 className="font-display font-bold text-6xl md:text-7xl text-bone mb-4 tracking-tight leading-none">
            Food &amp; Drink
          </h1>
          <p className="font-body text-xl md:text-2xl text-paper/70 max-w-2xl">
            Italian-made pizza from a guest of honour, a sausage sizzle out of
            our own kitchen, and a cake stall run the way school fetes have
            always run them.
          </p>
        </div>
      </div>

      <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 md:py-20">
        {/* Rocket Boy. Given his own section because he is an outside vendor
            with his own stall, not something the P&C kitchen is cooking. */}
        <div className="mb-16">
          <SectionHeading>Our guest stall</SectionHeading>

          <div className="bg-bone border-t-4 border-rust shadow-[0_2px_20px_rgba(26,26,26,0.12)] overflow-hidden flex flex-col md:flex-row">
            {/* Both pizzas, stacked down the left. Two photos of the same
                thing side by side would compete; stacked they read as a menu. */}
            <div className="md:w-1/2 flex flex-col">
              {ROCKET_BOY.photos.map((photo) => (
                <Image
                  key={photo.src}
                  src={photo.src}
                  alt={photo.alt}
                  width={500}
                  height={375}
                  className="w-full aspect-[4/3] object-cover"
                />
              ))}
            </div>

            <div className="md:w-1/2 flex flex-col justify-center p-8 md:p-10">
              {/* His mark, at his own aspect ratio on the white it was drawn
                  for. Sized by height so the wordmark stays legible rather
                  than stretching to whatever the column happens to be. */}
              <div className="bg-white inline-flex self-start p-4 md:p-5 mb-6 shadow-[0_2px_12px_rgba(26,26,26,0.10)]">
                <Image
                  src={ROCKET_BOY.logo}
                  alt="Rocket Boy, pizza made better"
                  width={704}
                  height={284}
                  className="h-[52px] md:h-[64px] w-auto"
                />
              </div>

              <h2 className="font-display text-4xl md:text-5xl text-ink tracking-wide leading-tight mb-4">
                Rocket Boy
              </h2>
              <p className="font-body text-lg text-ink-soft leading-relaxed">
                Rocket Boy will be spinning out delicious Italian-made pizza,
                fresh from the oven. Vegetarian and non options both available.
              </p>
            </div>
          </div>
        </div>

        {/* Kitchen */}
        <div className="mb-16">
          <SectionHeading>Out of our kitchen</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {KITCHEN.map((item) => (
              <ItemCard key={item.name} item={item} />
            ))}
          </div>
        </div>

        {/* Sweets */}
        <div className="mb-16">
          <SectionHeading>Something sweet</SectionHeading>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {SWEETS.map((item) => (
              <ItemCard key={item.name} item={item} size="sm" />
            ))}
          </div>
        </div>

        {/* Cake stall */}
        <div className="mb-16">
          <SectionHeading>The cake stall</SectionHeading>

          <p className="font-body text-lg text-ink-soft leading-relaxed max-w-2xl mb-8">
            A proper homemade, old-school fete cake stall, baked by families and
            sold until it runs out. Which it will.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {CAKE_STALL.map((item) => (
              <ItemCard key={item.name} item={item} size="sm" />
            ))}
          </div>
        </div>

        {/* Allergens. Word for word the same answer as /faq, deliberately. Two
            pages giving slightly different allergen advice is worse than one
            page giving none. If this wording changes, change it in both. */}
        <div className="border-t border-dotted border-mist pt-8">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-rust-deep mb-3">
            Allergies
          </p>
          <p className="font-body text-base text-ink-soft max-w-3xl leading-relaxed">
            All food at the festival has allergen labelling. The kitchen handles
            common allergens (gluten, dairy, nuts) but cross-contamination is
            possible in a busy festival kitchen, so we can&apos;t guarantee
            allergen-free food. Bring backups for severe allergies.
          </p>
        </div>

        <p className="font-body text-base italic text-moss mt-10">
          Food is paid for with tokens.{" "}
          <a href="/tokens" className="text-rust hover:text-rust-deep underline">
            Pre-purchase online and save 15%
          </a>
          .
        </p>
      </section>
    </main>
  );
}
