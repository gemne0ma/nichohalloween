// Run with: npx tsx db/seed-tags.ts
// Seeds the tags table with the initial set. Safe to re-run
// (uses ON CONFLICT DO NOTHING).

import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { tags } from "./schema";

const INITIAL_TAGS = [
  { name: "Vendors", slug: "vendors", color: "#5A6B4F" },
  { name: "Sponsors", slug: "sponsors", color: "#D87A3F" },
  { name: "Auction", slug: "auction", color: "#4A2942" },
  { name: "Marketing", slug: "marketing", color: "#B85C2E" },
  { name: "Logistics", slug: "logistics", color: "#2D3A2E" },
  { name: "Admin", slug: "admin", color: "#A8AC9F" },
  { name: "Finance", slug: "finance", color: "#8B3F1F" },
];

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  for (const tag of INITIAL_TAGS) {
    await db
      .insert(tags)
      .values(tag)
      .onConflictDoNothing({ target: tags.slug });
  }

  console.log(`Seeded ${INITIAL_TAGS.length} tags (skipped any that already exist).`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
