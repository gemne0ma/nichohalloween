import { auth, clerkClient } from "@clerk/nextjs/server";

// Call at the top of every server action to ensure the caller is both
// authenticated AND on the approved admin email list.
// Belt-and-braces: middleware checks too, but server actions can be called
// directly so we verify here as well.
export async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const userEmail = user.emailAddresses
    .find((e) => e.id === user.primaryEmailAddressId)
    ?.emailAddress?.toLowerCase();

  const allowed = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!userEmail || !allowed.includes(userEmail)) {
    throw new Error("Not an approved admin");
  }

  return userId;
}
