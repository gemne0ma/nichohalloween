import SiteNav from "../components/SiteNav";

// This layout wraps all public-facing pages (everything except /admin).
// It adds the sticky nav bar and a consistent footer.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteNav />
      {children}
      <footer className="bg-forest-deep text-paper/70 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-xs uppercase tracking-[0.15em]">
            Nicho Halloween Festival &middot; Est. 1989
          </p>
          <p className="font-body text-sm">
            Nicholson Street Public School, Balmain East
          </p>
          <p className="font-mono text-xs uppercase tracking-[0.15em]">
            A community fundraiser by the school P&amp;C
          </p>
        </div>
      </footer>
    </>
  );
}
