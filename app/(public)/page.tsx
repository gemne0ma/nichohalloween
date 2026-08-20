import Countdown from "../components/Countdown";
import Link from "next/link";

const GHOSTS = [
  { src: "/auctiony.webp", alt: "Ghost auctioneer with gavel", label: "Silent auction", href: "/auction", rotate: "-rotate-2" },
  { src: "/tokens2.webp", alt: "Ghost handing out festival tokens", label: "Get your tokens", href: "/tokens", rotate: "rotate-1" },
  { src: "/payup.webp", alt: "Two ghosts at the general store cash register", label: "General store", href: "/attractions", rotate: "-rotate-1" },
  { src: "/thanks.webp", alt: "Ghost holding a thank you sign", label: "Our sponsors", href: "/sponsors", rotate: "rotate-2" },
];

export default function Home() {
  return (
    <main>
      {/* ─── Hero section (halloween.webp background) ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-start pt-16 md:justify-center md:pt-8 px-4 md:px-8 pb-4 overflow-hidden">
        {/* Background image: mobile-cropped version focused on yellow-hat ghost, full image on desktop */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[url('/halloween-mobile.webp')] md:bg-[url('/halloween.webp')] bg-cover bg-center pointer-events-none"
        />

        {/* Dark overlay: lighter on mobile so ghost reads better in lower half */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/30 md:from-black/30 md:via-black/50 md:to-black/70 pointer-events-none"
        />

        {/* Foreground content */}
        {/* DOM order = mobile: Plank → Date → Title → Meta → Countdown */}
        {/* Desktop via md:order: Date(1) → Title(2) → Plank(3) → Meta(4) → Countdown(5) */}
        <div className="relative flex flex-col items-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
          {/* Subtitle on a wooden plank. Desktop only: the plank is the
              background image and the line sits on it, so hiding the text
              alone would leave an empty sign. hidden md:flex, not md:block,
              because the flex centring is what positions the text. */}
          <div
            className="hidden md:flex md:order-3 mb-4 md:mb-3 w-[clamp(340px,85vw,986px)] max-w-[92vw] h-[clamp(95px,28vw,448px)] md:w-[clamp(314px,62vw,986px)] md:h-[clamp(134px,27vw,448px)] bg-[url('/plank.webp')] bg-[length:100%_100%] bg-no-repeat bg-center items-center justify-center"
          >
            <p className="font-halloween text-[clamp(14px,3.74vw,46px)] tracking-wide text-paper text-center whitespace-nowrap px-[10%] [text-shadow:_0_2px_14px_rgba(0,0,0,0.95)] relative top-[1px]">
              An iconic 37-year tradition
            </p>
          </div>

          {/* Eyebrow */}
          <p className="md:order-1 font-display font-bold text-sm md:text-3xl lg:text-4xl tracking-[0.1em] md:tracking-[0.3em] uppercase text-pumpkin mb-4 md:mb-3 [text-shadow:_0_2px_20px_rgba(0,0,0,0.8)] text-center">
            Saturday 24 October 2026 &middot; 3 to 7 pm
          </p>

          {/* Title */}
          {/* Mobile and desktop are sized independently on purpose.
              Desktop stays at 68% of the original, which is what Gemma
              signed off. Mobile goes back to its original 2.25rem: at
              1.53rem the title was only 1.7x the 14px meta line beneath it
              and stopped reading as a heading. Desktop had headroom to give
              away, a 390px phone does not. */}
          <h1 className="md:order-2 font-display font-bold text-[2.25rem] md:text-[4.08rem] lg:text-[5.44rem] xl:text-[6.8rem] text-center leading-[0.95] tracking-tight text-paper mt-2 md:mt-[100px] mb-4 md:mb-0">
            Nicho Halloween
            <br />
            Festival
          </h1>

          {/* Meta line */}
          <p className="md:order-4 font-mono text-sm md:text-lg font-bold tracking-[0.1em] md:tracking-[0.25em] uppercase text-paper mb-6 md:mb-3 text-center flex flex-wrap items-center justify-center gap-x-1 md:gap-x-0 [text-shadow:_0_2px_12px_rgba(0,0,0,0.8)]">
            <span>Live music</span> <span className="text-pumpkin mx-1 md:mx-3 text-[1.2em] md:text-[3em] leading-none align-middle relative -top-[1px] md:-top-[2px]">&middot;</span> <span>Games</span>{" "}
            <span className="text-pumpkin mx-1 md:mx-3 text-[1.2em] md:text-[3em] leading-none align-middle relative -top-[1px] md:-top-[2px]">&middot;</span> <span>Haunted house</span>{" "}
            <span className="text-pumpkin mx-1 md:mx-3 text-[1.2em] md:text-[3em] leading-none align-middle relative -top-[1px] md:-top-[2px]">&middot;</span> <span>Tasty food</span>
          </p>

          {/* Countdown with "Haunted sleeps to go" graphic.
              Order is unchanged, graphic above the numbers. The mobile gap is
              tightened so the graphic sits on top of the countdown rather
              than floating apart from it. Desktop is untouched. */}
          <div className="md:order-5 flex flex-col md:flex-row items-center gap-0 md:gap-6">
            <img
              src="/text.webp"
              alt="Haunted sleeps to go"
              /* -mb-3 on mobile only. The 15deg tilt leaves empty space inside
                 the image's upright bounding box, so a negative margin pulls
                 the countdown up into it. Desktop keeps its natural spacing. */
              className="w-[160px] md:w-[360px] h-auto -rotate-[15deg] -mb-3 md:mb-0"
            />
            <Countdown />
          </div>
        </div>
      </section>

      {/* ─── Ghost gallery section ─── */}
      <section className="bg-paper py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-rust-deep text-center mb-10">
            Meet the crew
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {GHOSTS.map((ghost) => (
              <Link
                key={ghost.src}
                href={ghost.href}
                className={`group block ${ghost.rotate} hover:scale-105 transition-transform`}
              >
                <div className="bg-bone p-2 md:p-3 pb-10 md:pb-14 shadow-[3px_4px_12px_rgba(26,26,26,0.12)] group-hover:shadow-[5px_7px_20px_rgba(26,26,26,0.2)] transition-shadow">
                  <img
                    src={ghost.src}
                    alt={ghost.alt}
                    className="w-full aspect-[3/4] object-cover object-top"
                  />
                  <p className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.15em] text-moss text-center mt-2 md:mt-3">
                    {ghost.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
