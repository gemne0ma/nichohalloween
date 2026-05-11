"use server";

import { db } from "@/db";
import { auctionItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

type AuctionStatus = "pending" | "received" | "listed" | "sold";

export async function createAuctionItem(formData: FormData) {
  await requireAdmin();
  const itemName = formData.get("itemName") as string;
  const classroom = (formData.get("classroom") as string) || null;
  const donor = (formData.get("donor") as string) || null;
  const estimatedRaw = formData.get("estimatedValue") as string;
  const estimatedValue = estimatedRaw ? Math.round(parseFloat(estimatedRaw) * 100) : null;
  const notes = (formData.get("notes") as string) || null;
  const photoUrl = (formData.get("photoUrl") as string) || null;

  await db.insert(auctionItems).values({
    itemName,
    classroom,
    donor,
    estimatedValue,
    photoUrl,
    notes,
  });

  revalidatePath("/admin/auction");
  revalidatePath("/admin");
}

export async function updateAuctionItem(
  itemId: string,
  data: {
    itemName: string;
    classroom: string | null;
    donor: string | null;
    estimatedValue: number | null;
    photoUrl: string | null;
    status: AuctionStatus;
    platformListingUrl: string | null;
    notes: string | null;
  }
) {
  await requireAdmin();
  await db
    .update(auctionItems)
    .set(data)
    .where(eq(auctionItems.id, itemId));

  revalidatePath("/admin/auction");
  revalidatePath("/admin");
}

export async function deleteAuctionItem(itemId: string) {
  await requireAdmin();
  await db.delete(auctionItems).where(eq(auctionItems.id, itemId));
  revalidatePath("/admin/auction");
  revalidatePath("/admin");
}
