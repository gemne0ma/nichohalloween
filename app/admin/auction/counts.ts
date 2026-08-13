import { db } from "@/db";
import { auctionProspects, classroomLots, tasks } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

export type AuctionTabCounts = {
  outreach: number;
  classrooms: number;
  tasks: number;
};

// One round trip per tab, run in parallel. Counts match what each panel
// lists, so the number on the tab and the number in the panel agree.
export async function getAuctionTabCounts(): Promise<AuctionTabCounts> {
  const [outreach, classroomRows, taskRows] = await Promise.all([
    db.select({ n: sql<number>`count(*)` }).from(auctionProspects),
    // Lots in, not classrooms. "Classrooms 4" tells nobody anything;
    // "Classrooms 12" is the number the committee actually chases.
    db
      .select({ n: sql<number>`coalesce(sum(${classroomLots.itemsReceived}), 0)` })
      .from(classroomLots),
    db
      .select({ n: sql<number>`count(*)` })
      .from(tasks)
      .where(eq(tasks.bucket, "auction")),
  ]);

  return {
    outreach: Number(outreach[0].n),
    classrooms: Number(classroomRows[0].n),
    tasks: Number(taskRows[0].n),
  };
}
