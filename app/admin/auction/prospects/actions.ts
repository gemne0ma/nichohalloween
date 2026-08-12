"use server";

import { db } from "@/db";
import { auctionProspects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getAllProspects, type ProspectStatus } from "./queries";

const PATH = "/admin/auction/prospects";

export type ProspectInput = {
  businessName: string;
  suburb: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string | null;
};

export type DuplicateMatch = {
  id: string;
  businessName: string;
  status: ProspectStatus;
  addedBy: string | null;
};

// Strip the noise that makes two spellings of the same business look different:
// case, punctuation, and the words nobody agrees on including.
function normalise(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(pty|ltd|limited|inc|incorporated|co|the|and)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Loose match. Exact after normalising, or one name contained in the other,
// which catches "Balmain Wellness" against "Balmain Wellness Co".
function isSimilar(a: string, b: string): boolean {
  const na = normalise(a);
  const nb = normalise(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length >= 4 && nb.length >= 4) {
    return na.includes(nb) || nb.includes(na);
  }
  return false;
}

// Called before an add so the UI can warn. Never blocks: the caller decides.
export async function findSimilarProspects(
  name: string
): Promise<DuplicateMatch[]> {
  await requireAdmin();
  if (!name.trim()) return [];

  // A few hundred rows at most, so filtering in JS beats fighting SQL for
  // fuzzy matching. Revisit if this ever holds thousands.
  const all = await getAllProspects();
  return all
    .filter((p) => isSimilar(p.businessName, name))
    .map((p) => ({
      id: p.id,
      businessName: p.businessName,
      status: p.status,
      addedBy: p.createdByName,
    }));
}

export async function createProspect(input: ProspectInput) {
  const userId = await requireAdmin();

  const businessName = input.businessName.trim();
  if (!businessName) {
    throw new Error("Business name is required");
  }

  await db.insert(auctionProspects).values({
    businessName,
    suburb: input.suburb?.trim() || null,
    contactName: input.contactName?.trim() || null,
    contactEmail: input.contactEmail?.trim() || null,
    contactPhone: input.contactPhone?.trim() || null,
    notes: input.notes?.trim() || null,
    // Whoever adds it is chasing it until someone reassigns.
    owner: userId,
    createdBy: userId,
  });

  revalidatePath(PATH);
}

export type BulkSkip = {
  pastedName: string;
  matchedName: string;
  matchedStatus: ProspectStatus;
  matchedAddedBy: string | null;
};

export type BulkAddResult = {
  created: number;
  createdNames: string[];
  skippedBlank: number;
  skipped: BulkSkip[];
};

// Paste a list, one business per line. Everything lands at not_contacted.
// Near-matches against existing businesses are skipped, not created. The
// caller gets them back so a genuinely different business can be added
// individually through the single-add form, which allows "Add anyway".
export async function bulkAddProspects(raw: string): Promise<BulkAddResult> {
  const userId = await requireAdmin();

  const lines = raw.split("\n").map((l) => l.trim());
  const names = lines.filter(Boolean);
  const skippedBlank = lines.length - names.length;

  // De-duplicate within the paste itself, so a list with the same shop twice
  // creates one row, not two.
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const name of names) {
    const key = normalise(name);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(name);
  }

  if (unique.length === 0) {
    return { created: 0, createdNames: [], skippedBlank, skipped: [] };
  }

  const existing = await getAllProspects();

  const toCreate: string[] = [];
  const skipped: BulkSkip[] = [];

  for (const name of unique) {
    const match = existing.find((p) => isSimilar(p.businessName, name));
    if (match) {
      skipped.push({
        pastedName: name,
        matchedName: match.businessName,
        matchedStatus: match.status,
        matchedAddedBy: match.createdByName,
      });
    } else {
      toCreate.push(name);
    }
  }

  if (toCreate.length > 0) {
    await db.insert(auctionProspects).values(
      toCreate.map((businessName) => ({
        businessName,
        owner: userId,
        createdBy: userId,
      }))
    );
    revalidatePath(PATH);
  }

  return {
    created: toCreate.length,
    createdNames: toCreate,
    skippedBlank,
    skipped,
  };
}

// Inline status change from the list. Stamps last_contacted_at, which is why
// status is not editable through updateProspect.
export async function updateProspectStatus(
  prospectId: string,
  status: ProspectStatus
) {
  await requireAdmin();

  await db
    .update(auctionProspects)
    .set({
      status,
      lastContactedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(auctionProspects.id, prospectId));

  revalidatePath(PATH);
}

// Inline edit from the Item value column. Deliberately does not touch
// last_contacted_at: recording a value is not contact.
export async function updateProspectItemValue(
  prospectId: string,
  itemValueCents: number | null
) {
  await requireAdmin();

  await db
    .update(auctionProspects)
    .set({ itemValueCents, updatedAt: new Date() })
    .where(eq(auctionProspects.id, prospectId));

  revalidatePath(PATH);
}

export async function updateProspect(
  prospectId: string,
  data: {
    businessName: string;
    suburb: string | null;
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    notes: string | null;
    item: string | null;
    itemValueCents: number | null;
    owner: string | null;
    doNotContact: boolean;
  }
) {
  await requireAdmin();

  if (!data.businessName.trim()) {
    throw new Error("Business name is required");
  }

  await db
    .update(auctionProspects)
    .set({ ...data, businessName: data.businessName.trim(), updatedAt: new Date() })
    .where(eq(auctionProspects.id, prospectId));

  revalidatePath(PATH);
}

export async function setDoNotContact(prospectId: string, value: boolean) {
  await requireAdmin();

  await db
    .update(auctionProspects)
    .set({ doNotContact: value, updatedAt: new Date() })
    .where(eq(auctionProspects.id, prospectId));

  revalidatePath(PATH);
}

// No delete action by design. 'declined' closes a business out and keeps the
// record that we asked, so nobody asks the same shop twice next year.
