import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const user = await currentUser();

  // Middleware should catch this, but belt-and-braces.
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-paper p-8">
      <p className="font-mono text-sm uppercase tracking-widest text-rust-deep mb-2">
        Admin Dashboard
      </p>
      <h1 className="font-display text-4xl text-ink mb-6">
        Hello, {user.firstName || user.emailAddresses[0]?.emailAddress}
      </h1>
      <p className="font-body text-lg text-ink-soft">
        You are logged in. The dashboard lives here. We will build it out soon.
      </p>
    </main>
  );
}
