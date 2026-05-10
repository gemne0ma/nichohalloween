import { notFound } from "next/navigation";
import { getTasksByBucket, getAdminUsers, getAllTags } from "../../queries";
import TaskBoard from "../TaskBoard";

const BUCKET_LABELS: Record<string, string> = {
  sponsorship: "Sponsorship",
  auction: "Auction",
  vendors: "Vendors",
  attractions: "Attractions",
  marketing: "Marketing",
  build: "Build",
};

export default async function TaskBucketPage({
  params,
}: {
  params: Promise<{ bucket: string }>;
}) {
  const { bucket } = await params;

  if (!(bucket in BUCKET_LABELS)) {
    notFound();
  }

  const [tasks, adminUsers, allTags] = await Promise.all([
    getTasksByBucket(bucket),
    getAdminUsers(),
    getAllTags(),
  ]);

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-[900px]">
      <TaskBoard
        bucket={bucket}
        bucketLabel={BUCKET_LABELS[bucket]}
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
    </div>
  );
}
