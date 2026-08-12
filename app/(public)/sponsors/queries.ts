// Public sponsor query. Used by app/(public)/sponsors/page.tsx and nowhere
// else. Deliberately NOT getAllSponsors() from app/admin/queries.ts, which
// does select * and would carry contact, email, committed_amount,
// paid_amount, thanked and notes into a public page.
//
// Throws at build time if this module is ever imported into a client
// component, which is the whole point of keeping it separate.
import "server-only";

import { db } from "@/db";
import { sponsors } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export type PublicSponsor = {
  name: string;
  tier: "gold" | "silver" | "bronze" | null;
  logoUrl: string | null;
};

// Three columns. Add a fourth only if it is genuinely safe to publish to
// anyone on the internet, and rename this comment when you do.
export async function getPublishedSponsors(): Promise<PublicSponsor[]> {
  return db
    .select({
      name: sponsors.businessName,
      tier: sponsors.tier,
      logoUrl: sponsors.logoUrl,
    })
    .from(sponsors)
    .where(eq(sponsors.published, true))
    .orderBy(asc(sponsors.businessName));
}
