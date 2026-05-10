"use server";

import { db } from "@/db";
import { sponsors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function createSponsor(formData: FormData) {
  await requireAdmin();
  const businessName = formData.get("businessName") as string;
  const contact = (formData.get("contact") as string) || null;
  const email = (formData.get("email") as string) || null;
  const tier = (formData.get("tier") as string) || null;
  const committedRaw = formData.get("committedAmount") as string;
  const committedAmount = committedRaw ? Math.round(parseFloat(committedRaw) * 100) : null;
  const notes = (formData.get("notes") as string) || null;

  await db.insert(sponsors).values({
    businessName,
    contact,
    email,
    tier: tier as "gold" | "silver" | "bronze" | null,
    committedAmount,
    notes,
  });

  revalidatePath("/admin/sponsors");
  revalidatePath("/admin");
}

export async function updateSponsor(
  sponsorId: string,
  data: {
    businessName: string;
    contact: string | null;
    email: string | null;
    tier: "gold" | "silver" | "bronze" | null;
    committedAmount: number | null;
    paidAmount: number | null;
    logoUrl: string | null;
    thanked: boolean;
    notes: string | null;
  }
) {
  await requireAdmin();
  await db
    .update(sponsors)
    .set(data)
    .where(eq(sponsors.id, sponsorId));

  revalidatePath("/admin/sponsors");
  revalidatePath("/admin");
}

export async function deleteSponsor(sponsorId: string) {
  await requireAdmin();
  await db.delete(sponsors).where(eq(sponsors.id, sponsorId));
  revalidatePath("/admin/sponsors");
  revalidatePath("/admin");
}
