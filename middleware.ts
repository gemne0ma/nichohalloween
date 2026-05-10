import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Protect all /admin routes and /api routes (except the Stripe webhook,
// which authenticates via signature verification instead of Clerk).
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/orders(.*)",
]);

const isPublicApiRoute = createRouteMatcher([
  "/api/stripe/webhook",
]);

// Parse the comma-separated allowlist once at startup.
function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req) && !isPublicApiRoute(req)) {
    const { userId } = await auth.protect();

    // Fetch the user's email from Clerk and check against the allowlist
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const userEmail = user.emailAddresses
      .find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress?.toLowerCase();

    const allowed = getAdminEmails();

    if (!userEmail || !allowed.includes(userEmail)) {
      // API routes get a 403, page routes get redirected
      if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/unauthorised", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
