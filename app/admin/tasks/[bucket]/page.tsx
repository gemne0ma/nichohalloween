import { notFound, redirect } from "next/navigation";

const VALID_BUCKETS = [
  "sponsorship",
  "auction",
  "vendors",
  "attractions",
  "marketing",
  "build",
];

// The per-bucket boards are gone from the sidebar. Every old URL still
// resolves: auction goes to its own tab, everything else lands on All tasks
// with that workstream already selected. No task is orphaned.
export default async function TaskBucketPage({
  params,
}: {
  params: Promise<{ bucket: string }>;
}) {
  const { bucket } = await params;

  if (!VALID_BUCKETS.includes(bucket)) {
    notFound();
  }

  if (bucket === "auction") {
    redirect("/admin/auction/tasks");
  }

  redirect(`/admin/tasks?bucket=${bucket}`);
}
