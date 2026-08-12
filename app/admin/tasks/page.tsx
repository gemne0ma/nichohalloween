import { db } from "@/db";
import { tasks, users } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getAdminUsers, getAllTags, type TaskTag } from "../queries";
import { tags as tagsTable, taskTags } from "@/db/schema";
import TaskBoard from "./TaskBoard";

const VALID_BUCKETS = [
  "sponsorship",
  "auction",
  "vendors",
  "attractions",
  "marketing",
  "build",
];

// Every task, every bucket. The bucket filter is what replaced the five
// workstream entries in the sidebar, so this page has to carry them all.
async function getAllTasks() {
  const rows = await db
    .select({
      id: tasks.id,
      bucket: tasks.bucket,
      title: tasks.title,
      description: tasks.description,
      assignedTo: tasks.assignedTo,
      assigneeName: users.name,
      dueDate: tasks.dueDate,
      status: tasks.status,
      notes: tasks.notes,
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.assignedTo, users.id))
    .orderBy(tasks.dueDate, tasks.createdAt);

  const ids = rows.map((r) => r.id);
  const tagMap = new Map<string, TaskTag[]>();

  if (ids.length > 0) {
    const tagRows = await db
      .select({
        taskId: taskTags.taskId,
        id: tagsTable.id,
        name: tagsTable.name,
        slug: tagsTable.slug,
        color: tagsTable.color,
      })
      .from(taskTags)
      .innerJoin(tagsTable, eq(taskTags.tagId, tagsTable.id))
      .where(inArray(taskTags.taskId, ids));

    for (const t of tagRows) {
      const list = tagMap.get(t.taskId) ?? [];
      list.push({ id: t.id, name: t.name, slug: t.slug, color: t.color });
      tagMap.set(t.taskId, list);
    }
  }

  return rows.map((r) => ({ ...r, tags: tagMap.get(r.id) ?? [] }));
}

export default async function AllTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ bucket?: string }>;
}) {
  const { bucket } = await searchParams;
  // ?bucket= comes from the old workstream URLs, which redirect here.
  const initialBucketFilter =
    bucket && VALID_BUCKETS.includes(bucket) ? bucket : "all";

  const [allTasks, adminUsers, allTags] = await Promise.all([
    getAllTasks(),
    getAdminUsers(),
    getAllTags(),
  ]);

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-[900px]">
      <TaskBoard
        bucket="all"
        bucketLabel="All tasks"
        allBuckets
        initialBucketFilter={initialBucketFilter}
        tasks={allTasks.map((t) => ({
          id: t.id,
          bucket: t.bucket,
          title: t.title,
          description: t.description,
          assignedTo: t.assignedTo,
          assigneeName: t.assigneeName,
          dueDate: t.dueDate,
          status: t.status,
          notes: t.notes,
          tags: t.tags,
        }))}
        adminUsers={adminUsers}
        allTags={allTags}
      />
    </div>
  );
}
