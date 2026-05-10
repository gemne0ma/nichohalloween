import { db } from "@/db";
import { users } from "@/db/schema";
import { sql } from "drizzle-orm";

// Upsert the current Clerk user into our users table.
// Called from the admin layout on every page load. Cheap: one
// INSERT ... ON CONFLICT that no-ops if nothing changed.
export async function syncUser(clerkUser: {
  id: string;
  email: string;
  name: string | null;
}) {
  await db
    .insert(users)
    .values({
      id: clerkUser.id,
      email: clerkUser.email,
      name: clerkUser.name,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: sql`excluded.email`,
        name: sql`excluded.name`,
      },
    });
}
