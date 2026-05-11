"use server";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { media } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteObject } from "@/lib/r2";
import { revalidatePath } from "next/cache";

export async function updateMedia(
  id: string,
  data: { caption?: string; altText?: string }
) {
  await requireAdmin();

  await db
    .update(media)
    .set({
      caption: data.caption ?? null,
      altText: data.altText ?? null,
    })
    .where(eq(media.id, id));

  revalidatePath("/admin/media");
}

export async function deleteMedia(id: string) {
  await requireAdmin();

  // Get the r2Key before deleting the record
  const [record] = await db
    .select({ r2Key: media.r2Key })
    .from(media)
    .where(eq(media.id, id));

  if (!record) {
    throw new Error("Media not found");
  }

  // Delete from R2 first, then from DB
  await deleteObject(record.r2Key);
  await db.delete(media).where(eq(media.id, id));

  revalidatePath("/admin/media");
}
