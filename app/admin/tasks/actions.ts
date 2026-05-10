"use server";

import { db } from "@/db";
import { tasks, taskTags } from "@/db/schema";
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
  const assignedTo = (formData.get("assignedTo") as string) || null;
  const tagIds = formData.getAll("tagIds") as string[];

  if (!title || !bucket) {
    throw new Error("Title and bucket are required");
  }

  const [newTask] = await db
    .insert(tasks)
    .values({
      title,
      bucket,
      description,
      dueDate,
      assignedTo: assignedTo || null,
      status: "todo",
    })
    .returning({ id: tasks.id });

  // Insert tag associations
  if (tagIds.length > 0 && newTask) {
    await db.insert(taskTags).values(
      tagIds.map((tagId) => ({ taskId: newTask.id, tagId }))
    );
  }

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
    assignedTo?: string | null;
    status?: TaskStatus;
    notes?: string | null;
  },
  tagIds?: string[]
) {
  await requireAdmin();

  // Update the task fields
  const { ...taskData } = data;
  await db
    .update(tasks)
    .set({ ...taskData, updatedAt: new Date() })
    .where(eq(tasks.id, taskId));

  // Replace tags if provided (delete all, re-insert)
  if (tagIds !== undefined) {
    await db.delete(taskTags).where(eq(taskTags.taskId, taskId));
    if (tagIds.length > 0) {
      await db.insert(taskTags).values(
        tagIds.map((tagId) => ({ taskId, tagId }))
      );
    }
  }

  revalidatePath("/admin/tasks", "layout");
  revalidatePath("/admin");
}

export async function deleteTask(taskId: string) {
  await requireAdmin();
  // taskTags cascade-deletes automatically
  await db.delete(tasks).where(eq(tasks.id, taskId));

  revalidatePath("/admin/tasks", "layout");
  revalidatePath("/admin");
}
