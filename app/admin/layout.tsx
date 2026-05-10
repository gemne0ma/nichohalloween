import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";

// Every page under /admin/* runs through this layout.
// If the visitor isn't logged in, they get bounced to /sign-in.
// Auth lives here (not middleware) to avoid Edge runtime issues with Clerk.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.emailAddresses[0]?.emailAddress || "Admin";

  return (
    <div className="flex min-h-screen">
      <AdminSidebar userName={displayName} />
      <main className="flex-1 bg-paper overflow-y-auto pt-14 md:pt-0">{children}</main>
    </div>
  );
}
