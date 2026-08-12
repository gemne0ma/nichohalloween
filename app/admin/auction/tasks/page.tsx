import { getTasksByBucket, getAdminUsers, getAllTags } from "../../queries";
import TaskBoard from "../../tasks/TaskBoard";
import AuctionShell from "../AuctionShell";

// The auction workstream board, now a tab rather than its own sidebar entry.
// /admin/tasks/auction redirects here.
export default async function AuctionTasksPage() {
  const [tasks, adminUsers, allTags] = await Promise.all([
    getTasksByBucket("auction"),
    getAdminUsers(),
    getAllTags(),
  ]);

  return (
    <AuctionShell active="tasks">
      <TaskBoard
        bucket="auction"
        bucketLabel="Auction"
        hideHeading
        tasks={tasks.map((t) => ({
          id: t.id,
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
    </AuctionShell>
  );
}
