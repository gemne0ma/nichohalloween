import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-6 py-20">
      <div className="max-w-lg w-full text-center">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-rust-deep mb-3">
          No worries
        </p>
        <h1 className="font-display font-bold text-5xl md:text-6xl text-ink mb-4 tracking-tight">
          Changed your mind?
        </h1>
        <p className="font-body text-xl text-ink-soft mb-10 leading-relaxed">
          Your payment wasn't processed. You can still grab tokens at the festival on the day,
          you'll just miss the 15% pre-purchase discount.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/tokens"
            className="inline-block font-mono text-[10px] uppercase tracking-[0.3em] bg-forest-deep text-bone px-8 py-3 hover:bg-rust transition-colors"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="inline-block font-mono text-[10px] uppercase tracking-[0.3em] bg-bone text-ink border border-dotted border-mist px-8 py-3 hover:bg-paper transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
