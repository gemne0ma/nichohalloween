import { db } from "@/db";
import { auctionProspects, prospectActivity, users } from "@/db/schema";
import { eq, asc, desc, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export type ProspectStatus =
  | "not_contacted"
  | "contacted"
  | "waiting_on_reply"
  | "agreed_to_donate"
  | "item_received"
  | "declined";

export type ProspectRow = {
  id: string;
  businessName: string;
  status: ProspectStatus;
  suburb: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string | null;
  item: string | null;
  itemValueCents: number | null;
  owner: string | null;
  ownerName: string | null;
  doNotContact: boolean;
  lastContactedAt: Date | null;
  createdBy: string | null;
  createdByName: string | null;
  createdAt: Date;
};

// Two joins onto users, so each needs its own alias.
const ownerUser = alias(users, "owner_user");
const creatorUser = alias(users, "creator_user");

export async function getAllProspects(): Promise<ProspectRow[]> {
  const rows = await db
    .select({
      id: auctionProspects.id,
      businessName: auctionProspects.businessName,
      status: auctionProspects.status,
      suburb: auctionProspects.suburb,
      contactName: auctionProspects.contactName,
      contactEmail: auctionProspects.contactEmail,
      contactPhone: auctionProspects.contactPhone,
      notes: auctionProspects.notes,
      item: auctionProspects.item,
      itemValueCents: auctionProspects.itemValueCents,
      owner: auctionProspects.owner,
      ownerName: ownerUser.name,
      ownerEmail: ownerUser.email,
      doNotContact: auctionProspects.doNotContact,
      lastContactedAt: auctionProspects.lastContactedAt,
      createdBy: auctionProspects.createdBy,
      createdByName: creatorUser.name,
      createdByEmail: creatorUser.email,
      createdAt: auctionProspects.createdAt,
    })
    .from(auctionProspects)
    .leftJoin(ownerUser, eq(auctionProspects.owner, ownerUser.id))
    .leftJoin(creatorUser, eq(auctionProspects.createdBy, creatorUser.id))
    .orderBy(asc(auctionProspects.businessName));

  // Fall back to email when a user has no display name yet.
  return rows.map((r) => ({
    ...r,
    ownerName: r.ownerName || r.ownerEmail || null,
    createdByName: r.createdByName || r.createdByEmail || null,
  })) as ProspectRow[];
}

// ─── Activity log ────────────────────────────────────────

export type ActivityEntry = {
  id: string;
  prospectId: string;
  kind: string; // manual | status_change | created
  body: string;
  actorName: string | null;
  createdAt: Date;
};

// Every entry for every business, grouped by prospect. One query rather than
// one per row: the log renders inside the expandable row, and at a few
// hundred businesses this is far cheaper than a request per expand.
export async function getActivityByProspect(): Promise<Map<string, ActivityEntry[]>> {
  const rows = await db
    .select({
      id: prospectActivity.id,
      prospectId: prospectActivity.prospectId,
      kind: prospectActivity.kind,
      body: prospectActivity.body,
      actorName: users.name,
      actorEmail: users.email,
      createdAt: prospectActivity.createdAt,
    })
    .from(prospectActivity)
    .leftJoin(users, eq(prospectActivity.actorId, users.id))
    .orderBy(desc(prospectActivity.createdAt));

  const map = new Map<string, ActivityEntry[]>();
  for (const r of rows) {
    const list = map.get(r.prospectId) ?? [];
    list.push({
      id: r.id,
      prospectId: r.prospectId,
      kind: r.kind,
      body: r.body,
      actorName: r.actorName || r.actorEmail || null,
      createdAt: r.createdAt,
    });
    map.set(r.prospectId, list);
  }
  return map;
}
