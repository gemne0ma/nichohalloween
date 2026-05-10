import { db } from "@/db";
import { tokenOrders, sponsors, tasks, auctionItems, vendors, users, tags, taskTags } from "@/db/schema";
import { eq, sql, desc, and, ne, asc, ilike, or, inArray } from "drizzle-orm";

// ─── Stat tile data ─────────────────────────────────────

export async function getTokenStats() {
  const result = await db
    .select({
      totalOrders: sql<number>`count(*)`,
      totalRevenue: sql<number>`coalesce(sum(${tokenOrders.amountPaid}), 0)`,
      totalTokens: sql<number>`coalesce(sum(${tokenOrders.tokensPurchased}), 0)`,
    })
    .from(tokenOrders);

  return {
    totalOrders: Number(result[0].totalOrders),
    totalRevenue: Number(result[0].totalRevenue),
    totalTokens: Number(result[0].totalTokens),
  };
}

export async function getSponsorStats() {
  const result = await db
    .select({
      count: sql<number>`count(*)`,
      totalCommitted: sql<number>`coalesce(sum(${sponsors.committedAmount}), 0)`,
      totalPaid: sql<number>`coalesce(sum(${sponsors.paidAmount}), 0)`,
    })
    .from(sponsors);

  return {
    count: Number(result[0].count),
    totalCommitted: Number(result[0].totalCommitted),
    totalPaid: Number(result[0].totalPaid),
  };
}

export async function getTaskStats() {
  const result = await db
    .select({
      total: sql<number>`count(*)`,
      open: sql<number>`count(*) filter (where ${tasks.status} != 'done')`,
      dueThisWeek: sql<number>`count(*) filter (where ${tasks.status} != 'done' and ${tasks.dueDate} <= current_date + interval '7 days' and ${tasks.dueDate} >= current_date)`,
      overdue: sql<number>`count(*) filter (where ${tasks.status} != 'done' and ${tasks.dueDate} < current_date)`,
    })
    .from(tasks);

  return {
    total: Number(result[0].total),
    open: Number(result[0].open),
    dueThisWeek: Number(result[0].dueThisWeek),
    overdue: Number(result[0].overdue),
  };
}

export async function getAuctionStats() {
  const result = await db
    .select({
      total: sql<number>`count(*)`,
      received: sql<number>`count(*) filter (where ${auctionItems.status} != 'pending')`,
    })
    .from(auctionItems);

  return {
    total: Number(result[0].total),
    received: Number(result[0].received),
  };
}

// ─── Latest token orders (for sidebar card) ─────────────

export async function getLatestOrders(limit = 5) {
  return db
    .select({
      orderNumber: tokenOrders.orderNumber,
      purchaserName: tokenOrders.purchaserName,
      tokensPurchased: tokenOrders.tokensPurchased,
      amountPaid: tokenOrders.amountPaid,
      createdAt: tokenOrders.createdAt,
    })
    .from(tokenOrders)
    .orderBy(desc(tokenOrders.createdAt))
    .limit(limit);
}

// ─── Sponsor pipeline (for sidebar card) ─────────────────

export async function getSponsorPipeline() {
  return db
    .select({
      id: sponsors.id,
      businessName: sponsors.businessName,
      tier: sponsors.tier,
      committedAmount: sponsors.committedAmount,
      paidAmount: sponsors.paidAmount,
    })
    .from(sponsors)
    .orderBy(desc(sponsors.committedAmount));
}

// ─── Vendor payments due ─────────────────────────────────

export async function getVendorPaymentsDue() {
  return db
    .select({
      id: vendors.id,
      name: vendors.name,
      quotedAmount: vendors.quotedAmount,
      booked: vendors.booked,
      paid: vendors.paid,
    })
    .from(vendors)
    .orderBy(desc(vendors.quotedAmount));
}

// ─── Money raised summary ────────────────────────────────

export async function getMoneyRaised() {
  const [tokenResult, sponsorResult] = await Promise.all([
    db
      .select({
        total: sql<number>`coalesce(sum(${tokenOrders.amountPaid}), 0)`,
      })
      .from(tokenOrders),
    db
      .select({
        total: sql<number>`coalesce(sum(${sponsors.paidAmount}), 0)`,
      })
      .from(sponsors),
  ]);

  const tokenRevenue = Number(tokenResult[0].total);
  const sponsorRevenue = Number(sponsorResult[0].total);

  return {
    tokenRevenue,
    sponsorRevenue,
    auctionRevenue: 0, // External platform, entered manually later
    total: tokenRevenue + sponsorRevenue,
  };
}

// ─── Tasks by bucket (for task boards) ───────────────────

export type TaskTag = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
};

export type TaskRow = {
  id: string;
  bucket: string;
  title: string;
  description: string | null;
  ownerId: string | null;
  assignedTo: string | null;
  assigneeName: string | null;
  dueDate: string | null;
  status: "todo" | "in_progress" | "blocked" | "done";
  notes: string | null;
  tags: TaskTag[];
  createdAt: Date;
  updatedAt: Date;
};

export async function getTasksByBucket(bucket: string): Promise<TaskRow[]> {
  // Fetch tasks with assignee name via left join
  const rows = await db
    .select({
      id: tasks.id,
      bucket: tasks.bucket,
      title: tasks.title,
      description: tasks.description,
      ownerId: tasks.ownerId,
      assignedTo: tasks.assignedTo,
      assigneeName: users.name,
      dueDate: tasks.dueDate,
      status: tasks.status,
      notes: tasks.notes,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.assignedTo, users.id))
    .where(eq(tasks.bucket, bucket as any))
    .orderBy(tasks.dueDate, tasks.createdAt);

  // Fetch tags for all tasks in this bucket in one query
  const taskIds = rows.map((r) => r.id);
  let tagMap = new Map<string, TaskTag[]>();

  if (taskIds.length > 0) {
    const tagRows = await db
      .select({
        taskId: taskTags.taskId,
        tagId: tags.id,
        tagName: tags.name,
        tagSlug: tags.slug,
        tagColor: tags.color,
      })
      .from(taskTags)
      .innerJoin(tags, eq(taskTags.tagId, tags.id))
      .where(inArray(taskTags.taskId, taskIds));

    for (const row of tagRows) {
      const existing = tagMap.get(row.taskId) || [];
      existing.push({
        id: row.tagId,
        name: row.tagName,
        slug: row.tagSlug,
        color: row.tagColor,
      });
      tagMap.set(row.taskId, existing);
    }
  }

  return rows.map((r) => ({
    ...r,
    tags: tagMap.get(r.id) || [],
  })) as TaskRow[];
}

// ─── Admin users (for assignee dropdowns) ───────────────

export type AdminUser = {
  id: string;
  name: string | null;
  email: string;
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .orderBy(users.name);
}

// ─── All tags (for tag pickers) ─────────────────────────

export async function getAllTags(): Promise<TaskTag[]> {
  return db
    .select({ id: tags.id, name: tags.name, slug: tags.slug, color: tags.color })
    .from(tags)
    .orderBy(tags.name);
}

// ─── Full register queries ──────────────────────────────

export async function getAllVendors() {
  return db.select().from(vendors).orderBy(asc(vendors.name));
}

export async function getAllSponsors() {
  return db.select().from(sponsors).orderBy(desc(sponsors.committedAmount));
}

export async function getAllAuctionItems() {
  return db.select().from(auctionItems).orderBy(asc(auctionItems.classroom), asc(auctionItems.itemName));
}

export async function getAllOrders(search?: string) {
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    return db
      .select()
      .from(tokenOrders)
      .where(
        or(
          ilike(tokenOrders.purchaserName, term),
          ilike(tokenOrders.purchaserEmail, term),
          ilike(tokenOrders.orderNumber, term),
        )
      )
      .orderBy(desc(tokenOrders.createdAt));
  }
  return db.select().from(tokenOrders).orderBy(desc(tokenOrders.createdAt));
}

// ─── Upcoming tasks across all buckets ───────────────────

export async function getUpcomingTasks(limit = 8) {
  return db
    .select({
      id: tasks.id,
      bucket: tasks.bucket,
      title: tasks.title,
      ownerId: tasks.ownerId,
      dueDate: tasks.dueDate,
      status: tasks.status,
    })
    .from(tasks)
    .where(ne(tasks.status, "done"))
    .orderBy(tasks.dueDate, tasks.createdAt)
    .limit(limit);
}
