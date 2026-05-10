import Countdown from "../components/Countdown";
import Link from "next/link";

const GHOSTS = [
  { src: "/auctiony.png", alt: "Ghost auctioneer with gavel", label: "Silent auction", href: "/auction", rotate: "-rotate-2" },
  { src: "/tokens2.png", alt: "Ghost handing out festival tokens", label: "Get your tokens", href: "/tokens", rotate: "rotate-1" },
  { src: "/payup.png", alt: "Two ghosts at the general store cash register", label: "General store", href: "/attractions", rotate: "-rotate-1" },
  { src: "/thanks.png", alt: "Ghost holding a thank you sign", label: "Our sponsors", href: "/sponsors", rotate: "rotate-2" },
];

export default function Home() {
  return (
    <main>
      {/* ─── Hero section (Halloween.png background) ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 md:px-8 pt-6 md:pt-8 pb-4 overflow-hidden">
        {/* Background image: mobile-cropped version focused on yellow-hat ghost, full image on desktop */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[url('/Halloween-mobile.png')] md:bg-[url('/Halloween.png')] bg-cover bg-center pointer-events-none"
        />

        {/* Dark overlay so light text reads against the photo */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70 pointer-events-none"
        />

        {/* Foreground content, all light text */}
        <div className="relative flex flex-col items-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
          {/* Eyebrow */}
          <p className="font-display font-bold text-sm md:text-3xl lg:text-4xl tracking-[0.1em] md:tracking-[0.3em] uppercase text-pumpkin mb-3 [text-shadow:_0_2px_20px_rgba(0,0,0,0.8)] text-center">
            Saturday 24 October 2026 &middot; 3 to 7 pm
          </p>

          {/* Title */}
          <h1 className="font-display font-bold text-4xl md:text-8xl lg:text-9xl xl:text-[10rem] text-center leading-[0.95] tracking-tight text-paper mt-8 md:mt-[100px]">
            Nicho Halloween
            <br />
            Festival
          </h1>

          {/* Subtitle on a wooden plank */}
          <div
            className="relative mb-3 w-[clamp(280px,55vw,880px)] max-w-[92vw] h-[clamp(120px,24vw,400px)] bg-[url('/plank.png')] bg-[length:100%_100%] bg-no-repeat bg-center flex items-center justify-center"
          >
            <p className="font-display text-[clamp(16px,3.74vw,46px)] tracking-wide text-paper text-center whitespace-nowrap px-[10%] [text-shadow:_0_2px_14px_rgba(0,0,0,0.95)] relative top-[1px]">
              An iconic 37-year tradition
            </p>
          </div>

          {/* Meta line */}
          <p className="font-mono text-[10px] md:text-lg tracking-[0.08em] md:tracking-[0.25em] uppercase text-paper mb-3 text-center flex flex-wrap items-center justify-center gap-x-1 md:gap-x-0">
            <span>Live music</span> <span className="text-pumpkin mx-1 md:mx-3 text-[1.2em] md:text-[3em] leading-none align-middle relative -top-[1px] md:-top-[2px]">&middot;</span> <span>Games</span>{" "}
            <span className="text-pumpkin mx-1 md:mx-3 text-[1.2em] md:text-[3em] leading-none align-middle relative -top-[1px] md:-top-[2px]">&middot;</span> <span>Haunted house</span>{" "}
            <span className="text-pumpkin mx-1 md:mx-3 text-[1.2em] md:text-[3em] leading-none align-middle relative -top-[1px] md:-top-[2px]">&middot;</span> <span>Tasty food</span>
          </p>

          {/* Countdown with "Haunted sleeps to go" graphic to its left */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <img
              src="/text.png"
              alt="Haunted sleeps to go"
              className="w-[200px] md:w-[360px] h-auto -rotate-[15deg]"
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
