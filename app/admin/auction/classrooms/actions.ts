"use server";

import { db } from "@/db";
import { classroomLots } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

const PATH = "/admin/auction/classrooms";

export type ClassroomRow = {
  id: string;
  name: string;
  targetItems: number;
  itemsReceived: number;
  notes: string | null;
};

export async function getClassroomLots(): Promise<ClassroomRow[]> {
  return db
    .select({
      id: classroomLots.id,
      name: classroomLots.name,
      targetItems: classroomLots.targetItems,
      itemsReceived: classroomLots.itemsReceived,
      notes: classroomLots.notes,
    })
    .from(classroomLots)
    .orderBy(asc(classroomLots.sortOrder));
}

// Count only. Clamped at zero so a stray keystroke cannot go negative.
export async function setItemsReceived(id: string, itemsReceived: number) {
  await requireAdmin();
  const safe = Math.max(0, Math.floor(itemsReceived));

  await db
    .update(classroomLots)
    .set({ itemsReceived: safe, updatedAt: new Date() })
    .where(eq(classroomLots.id, id));

  revalidatePath(PATH);
}

export async function setClassroomNotes(id: string, notes: string | null) {
  await requireAdmin();
  await db
    .update(classroomLots)
    .set({ notes: notes?.trim() || null, updatedAt: new Date() })
    .where(eq(classroomLots.id, id));

  revalidatePath(PATH);
}
