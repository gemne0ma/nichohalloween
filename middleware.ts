import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk requires middleware to exist so auth() and currentUser() work in
// Server Components. This middleware does NOT protect any routes. Route
// protection lives in app/admin/layout.tsx instead.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
