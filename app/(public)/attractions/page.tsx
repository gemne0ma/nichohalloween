import AttractionImage from "./AttractionImage";

type Attraction = {
  num: string;
  title: string;
  desc: string;
  meta: string;
  gradient: string;
  image?: string;
};

const ATTRACTIONS: Attraction[] = [
  {
    num: "No. 01",
    title: "The Phantom Funfair",
    desc: "Roll up, Roll up! try your hand at our strong man striker, and games for the whole family to enjoy!",
    meta: "2 tokens · ages 4+",
    gradient: "from-ink-soft to-ink",
    image: "/tickets.jpg",
  },
  {
    num: "No. 02",
    title: "Little Shop of Horrors",
    desc: "A bewitching store filled with everything your heart desires, plushies, lanyards, hand held games, hippers and more. Tokens and eftpos accepted here!",
    meta: "Various · all ages",
    gradient: "from-rust to-rust-deep",
    image: "/LSH.jpg",
  },
  {
    num: "No. 03",
    title: "Inflatables",
    desc: "Head to our lower court, for all the bouncing high jinks! We've got a gravity defying slide, and a ninja warrior obstacle course - show your pals who's boss!",
    meta: "5 tokens · ages 5+",
    gradient: "from-plum to-forest-deep",
    image: "/inflatable.jpg",
  },
  {
    num: "No. 04",
    title: "Coffee and Snacks galore!",
    desc: "Adults, we gotchu. We wouldn't dream of not caffinating you as your little ones beg you for another turn on the slide! Not only will you get delicious  Little Marionette coffee, but we have snacks and food galore. You won't be going home hungry, that's for sure.",
    meta: "2 tokens · all ages",
    gradient: "from-pumpkin to-rust-deep",
    image: "/edcoffee.jpg",
  },
  {
    num: "No. 05",
    title: "Potion Making",
    desc: "Fizzing brew and spooky spells galore at our Witchcraft Workshop. Take home some potions to cast some spells, and make your wishes come true!",
    meta: "3 tokens · all ages",
    gradient: "from-moss to-plum",
    image: "/potions.jpg",
  },
  {
    num: "No. 06",
    title: "The Pumpkin Patch",
    desc: "",
    meta: "5 tokens per bag · all ages",
    gradient: "from-forest to-forest-deep",
    image: "/pump2.jpg",
  },
  {
    num: "No. 07",
    title: "Mini Monsters",
    desc: "The under-5s zone. Gentle games, face painting, craft tables and zero scares. A safe haven for the littlest festival-goers.",
    meta: "2 tokens · under 5s",
    gradient: "from-pumpkin to-rust",
    image: "/potions2.jpg",
  },
  {
    num: "No. 08",
    title: "Willy Wonka's Candy Wonderland",
    desc: "A candy paradise. Sweets, chocolates and lollies as far as the eye can see.",
    meta: "Various · all ages",
    gradient: "from-plum to-rust-deep",
    image: "/candy.jpg",
  },
  {
    num: "No. 09",
    title: "Tombolas",
    desc: "A festival favourite! buy a raffle, get the corresponding tombola. Luck of the draw!",
    meta: "2 tokens · all ages",
    gradient: "from-moss to-forest-deep",
    image: "/tombolas.jpg",
  },
];

export default function AttractionsPage() {
  return (
    <main className="min-h-screen bg-paper">
      {/* Hero image */}
      <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
        <img
          src="/scene3.png"
          alt="Festival scene at Nicholson Street Public School"
          className="absolute inset-0 w-full h-full object-cover object-[center_65%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-forest-deep/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-10 max-w-[1200px] mx-auto">
          <p className="font-display font-bold text-lg md:text-xl uppercase tracking-[0.35em] text-pumpkin mb-3 [text-shadow:_0_2px_28px_rgba(0,0,0,0.95)]">
            What you&apos;ll find
          </p>
          <h1 className="font-display font-bold text-6xl md:text-7xl text-bone tracking-tight leading-none">
            The Attractions
          </h1>
        </div>
      </div>

      <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 mb-16 items-start">
          <div className="font-body text-xl md:text-2xl text-ink-soft max-w-2xl space-y-4">
            <p>
              There truly is something for everyone when you step foot into our
              spook-tacular school!
            </p>
            <p>
              We&apos;ve a harrowing haunted house, a disco diva dance zone, or,
              try your chance at staying dry in the dunk tank!
            </p>
            <p>
              Perhaps games are your thing? We have a full phantom funfair, and a
              gravity defying inflatable slide to zoom down if you dare.
            </p>
            <p>
              Feel like grooving? Sing-a-long with Casey Burgess (hi-5), or mix a
              magical potion, and go candy crazy at Willy Wonka&apos;s factory!
            </p>
            <p>
              Plus, with our dedicated chill out zones, and our Mini Monsters (age
              4 and under) area - it&apos;s a fantastic family day out!
            </p>
          </div>

          {/* Polaroid linking to tokens page */}
          <a
            href="/tokens"
            className="group flex-shrink-0 self-center md:self-start md:mt-4 transition-transform hover:-rotate-1 hover:scale-105"
          >
            <div className="bg-bone p-3 pb-10 shadow-[4px_6px_16px_rgba(26,26,26,0.15)] rotate-2 group-hover:shadow-[6px_8px_24px_rgba(26,26,26,0.22)] transition-shadow w-[260px] md:w-[310px]">
              <img
                src="/tokens2.png"
                alt="Festival tokens, pre-purchase and save 15%"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
          </a>
        </div>

        {/* Attractions grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {ATTRACTIONS.map((attraction) => (
            <div
              key={attraction.num}
              className="bg-bone overflow-hidden transition-transform hover:-translate-y-1 shadow-[0_2px_12px_rgba(26,26,26,0.12),0_1px_3px_rgba(26,26,26,0.08)] hover:shadow-[0_4px_20px_rgba(26,26,26,0.18),0_2px_6px_rgba(26,26,26,0.1)] border-t-4 border-rust"
            >
              {/* Image placeholder */}
              <AttractionImage
                image={attraction.image}
                gradient={attraction.gradient}
                title={attraction.title}
              />

              {/* Card body */}
              <div className="p-6 md:p-7">
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-rust-deep mb-2">
                  {attraction.num}
                </p>
                <h2 className="font-display text-2xl md:text-3xl text-ink tracking-wide leading-tight mb-3">
                  {attraction.title}
                </h2>
                <p className="font-body text-base text-ink-soft leading-relaxed">
                  {attraction.desc}
                </p>

                {/* Meta line */}
                <div className="mt-4 pt-3 border-t border-dotted border-mist">
                  <p className="font-mono text-xs uppercase tracking-[0.15em] text-moss">
                    {attraction.meta}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="font-display font-bold text-6xl md:text-7xl text-ink text-center mt-16 tracking-tight leading-none">
          ...and many more!
        </p>
      </section>
    </main>
  );
}
