"use server";

import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

type TaskBucket =
  | "sponsorship"
  | "auction"
  | "vendors"
  | "attractions"
  | "marketing"
  | "build";

type TaskStatus = "todo" | "in_progress" | "blocked" | "done";

export async function createTask(formData: FormData) {
  await requireAdmin();
  const title = formData.get("title") as string;
  const bucket = formData.get("bucket") as TaskBucket;
  const description = (formData.get("description") as string) || null;
  const dueDate = (formData.get("dueDate") as string) || null;

  if (!title || !bucket) {
    throw new Error("Title and bucket are required");
  }

  await db.insert(tasks).values({
    title,
    bucket,
    description,
    dueDate,
    status: "todo",
  });

  revalidatePath(`/admin/tasks/${bucket}`);
  revalidatePath("/admin");
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  await requireAdmin();
  await db
    .update(tasks)
    .set({ status, updatedAt: new Date() })
    .where(eq(tasks.id, taskId));

  revalidatePath("/admin/tasks", "layout");
  revalidatePath("/admin");
}

export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string | null;
    dueDate?: string | null;
    status?: TaskStatus;
    notes?: string | null;
  }
) {
  await requireAdmin();
  await db
    .update(tasks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(tasks.id, taskId));

  revalidatePath("/admin/tasks", "layout");
  revalidatePath("/admin");
}

export async function deleteTask(taskId: string) {
  await requireAdmin();
  await db.delete(tasks).where(eq(tasks.id, taskId));

  revalidatePath("/admin/tasks", "layout");
  revalidatePath("/admin");
}
