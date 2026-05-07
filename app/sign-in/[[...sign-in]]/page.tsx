import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-paper">
      <SignIn
        appearance={{
          elements: {
            // Override Clerk's default styling to match our palette.
            rootBox: "mx-auto",
            card: "bg-bone shadow-none border border-mist",
            headerTitle: "font-display text-ink",
            headerSubtitle: "font-body text-ink-soft",
            formButtonPrimary: "bg-forest hover:bg-forest-deep",
            footerActionLink: "text-rust hover:text-rust-deep",
          },
        }}
      />
    </main>
  );
}
