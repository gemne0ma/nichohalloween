import { notFound } from "next/navigation";
import { getTasksByBucket } from "../../queries";
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

  const tasks = await getTasksByBucket(bucket);

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-[900px]">
      <TaskBoard
        bucket={bucket}
        bucketLabel={BUCKET_LABELS[bucket]}
        tasks={tasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          dueDate: t.dueDate,
          status: t.status,
          notes: t.notes,
        }))}
      />
    </div>
  );
}
