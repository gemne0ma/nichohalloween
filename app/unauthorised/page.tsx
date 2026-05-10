export const metadata = {
  title: "Not Authorised | Nicho Halloween Festival",
};

export default function UnauthorisedPage() {
  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-rust-deep mb-4">
          Access restricted
        </p>
        <h1 className="font-display font-bold text-4xl md:text-5xl text-ink mb-6 tracking-tight">
          Not so fast
        </h1>
        <p className="font-body text-lg text-ink-soft mb-8">
          This account isn&apos;t approved for festival admin access. The
          dashboard is limited to committee members only.
        </p>
        <p className="font-body text-base text-moss mb-10">
          If you should have access, get in touch at{" "}
          <a
            href="mailto:hello@nichohalloween.com.au"
            className="text-rust hover:text-rust-deep underline underline-offset-2 transition-colors"
          >
            hello@nichohalloween.com.au
          </a>
        </p>
        <a
          href="/"
          className="font-mono text-xs uppercase tracking-[0.3em] bg-forest-deep text-bone px-6 py-3 hover:bg-rust transition-colors inline-block"
        >
          Back to the festival
        </a>
      </div>
    </main>
  );
}
