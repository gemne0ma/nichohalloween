import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Every page under /admin/* runs through this layout.
// If the visitor isn't logged in, they get bounced to /sign-in.
// This replaces Edge middleware, which had compatibility issues with Clerk on Vercel.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <>{children}</>;
}
