export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-8 overflow-hidden">
      {/* Background image */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[url('/Halloween.png')] bg-cover bg-center opacity-50 pointer-events-none"
      />

      {/* Foreground content */}
      <div className="relative flex flex-col items-center">
        {/* Eyebrow */}
        <p className="font-mono font-bold text-[16.5px] tracking-[0.4em] uppercase text-rust-deep mb-6">
          The 37th year &middot; Saturday 24 October 2026 &middot; 3 to 7 pm
        </p>

        {/* Title */}
        <h1 className="font-display text-7xl md:text-8xl lg:text-9xl text-center leading-[0.95] tracking-tight mb-4">
          Nicho Halloween
          <br />
          Festival
        </h1>

        {/* Subtitle */}
        <p className="font-body italic text-xl md:text-2xl text-ink-soft mt-2 mb-6 text-center max-w-xl">
          An iconic 37-year tradition, returning to Balmain East for one day
          only!
        </p>

        {/* Skull rule */}
        <div className="text-sm tracking-[1.2em] text-ink my-6">☠ ☠ ☠</div>

        {/* Meta line */}
        <p className="font-mono text-[13px] tracking-[0.25em] uppercase text-ink">
          Live music <span className="text-rust mx-3">&middot;</span> Games{" "}
          <span className="text-rust mx-3">&middot;</span> Haunted house{" "}
          <span className="text-rust mx-3">&middot;</span> Snacks
        </p>
      </div>
    </main>
  );
}
