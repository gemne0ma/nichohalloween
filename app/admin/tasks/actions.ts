"use server";

import { db } from "@/db";
import { tasks, taskTags, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { sendTaskAssignment } from "@/lib/email";

type TaskBucket =
  | "sponsorship"
  | "auction"
  | "vendors"
  | "attractions"
  | "marketing"
  | "build";

type TaskStatus = "todo" | "in_progress" | "blocked" | "done";

export async function createTask(formData: FormData) {
  const currentUserId = await requireAdmin();
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
      ownerId: currentUserId,
      status: "todo",
    })
    .returning({ id: tasks.id });

  // Insert tag associations
  if (tagIds.length > 0 && newTask) {
    await db.insert(taskTags).values(
      tagIds.map((tagId) => ({ taskId: newTask.id, tagId }))
    );
  }

  // Notify the assignee (if assigned to someone other than yourself)
  if (assignedTo && assignedTo !== currentUserId) {
    notifyAssignee({ assignedTo, assignerId: currentUserId, title, bucket, dueDate });
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
  const currentUserId = await requireAdmin();

  // Check if assignee is changing (so we know whether to notify)
  let previousAssignee: string | null = null;
  if (data.assignedTo !== undefined) {
    const existing = await db
      .select({ assignedTo: tasks.assignedTo, bucket: tasks.bucket })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);
    previousAssignee = existing[0]?.assignedTo ?? null;
  }

  // Update the task fields
  await db
    .update(tasks)
    .set({ ...data, updatedAt: new Date() })
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

  // Notify if assignee changed to someone new (and not yourself)
  if (
    data.assignedTo &&
    data.assignedTo !== previousAssignee &&
    data.assignedTo !== currentUserId
  ) {
    // Fetch the task title and bucket for the email
    const task = await db
      .select({ title: tasks.title, bucket: tasks.bucket, dueDate: tasks.dueDate })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (task[0]) {
      notifyAssignee({
        assignedTo: data.assignedTo,
        assignerId: currentUserId,
        title: task[0].title,
        bucket: task[0].bucket,
        dueDate: task[0].dueDate,
      });
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

// ─── Email notification helper ──────────────────────────
// Fire-and-forget. Looks up both users' names and emails from
// the DB, then sends via Resend. Errors are logged, not thrown,
// so a failed email never blocks a task operation.

function notifyAssignee(params: {
  assignedTo: string;
  assignerId: string;
  title: string;
  bucket: string;
  dueDate?: string | null;
}) {
  (async () => {
    try {
      const [assignee] = await db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, params.assignedTo))
        .limit(1);

      const [assigner] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, params.assignerId))
        .limit(1);

      if (!assignee?.email) return;

      await sendTaskAssignment({
        to: assignee.email,
        assigneeName: assignee.name || "there",
        assignerName: assigner?.name || "Someone",
        taskTitle: params.title,
        bucket: params.bucket,
        dueDate: params.dueDate,
      });
    } catch (err) {
      console.error("Task assignment notification failed:", err);
    }
  })();
}
