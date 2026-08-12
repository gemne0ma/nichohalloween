import { db } from "@/db";
import { auctionProspects, tasks } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

export type AuctionTabCounts = {
  outreach: number;
  tasks: number;
};

// One round trip per tab, run in parallel. Counts match what each panel
// lists, so the number on the tab and the number in the panel agree.
export async function getAuctionTabCounts(): Promise<AuctionTabCounts> {
  const [outreach, taskRows] = await Promise.all([
    db.select({ n: sql<number>`count(*)` }).from(auctionProspects),
    db
      .select({ n: sql<number>`count(*)` })
      .from(tasks)
      .where(eq(tasks.bucket, "auction")),
  ]);

  return {
    outreach: Number(outreach[0].n),
    tasks: Number(taskRows[0].n),
  };
}
