"use server";

import { db } from "@/db";
import { vendors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function createVendor(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  const contactName = (formData.get("contactName") as string) || null;
  const email = (formData.get("email") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const category = (formData.get("category") as string) || null;
  const quotedRaw = formData.get("quotedAmount") as string;
  const quotedAmount = quotedRaw ? Math.round(parseFloat(quotedRaw) * 100) : null;
  const notes = (formData.get("notes") as string) || null;

  await db.insert(vendors).values({
    name,
    contactName,
    email,
    phone,
    category,
    quotedAmount,
    notes,
  });

  revalidatePath("/admin/vendors");
  revalidatePath("/admin");
}

export async function updateVendor(
  vendorId: string,
  data: {
    name: string;
    contactName: string | null;
    email: string | null;
    phone: string | null;
    category: string | null;
    quotedAmount: number | null;
    booked: boolean;
    paid: boolean;
    invoiceUrl: string | null;
    notes: string | null;
  }
) {
  await requireAdmin();
  await db
    .update(vendors)
    .set(data)
    .where(eq(vendors.id, vendorId));

  revalidatePath("/admin/vendors");
  revalidatePath("/admin");
}

export async function deleteVendor(vendorId: string) {
  await requireAdmin();
  await db.delete(vendors).where(eq(vendors.id, vendorId));
  revalidatePath("/admin/vendors");
  revalidatePath("/admin");
}
