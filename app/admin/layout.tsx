import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";
import { syncUser } from "@/lib/sync-user";

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

  // Upsert this admin into our users table so they appear
  // in assignee dropdowns. Cheap INSERT ... ON CONFLICT.
  await syncUser({
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || "",
    name: displayName,
  });

  return (
    <div className="flex min-h-screen">
      <AdminSidebar userName={displayName} />
      <main className="flex-1 bg-paper overflow-y-auto pt-14 md:pt-0">{children}</main>
    </div>
  );
}
