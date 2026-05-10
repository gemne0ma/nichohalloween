import Link from "next/link";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { sql } from "drizzle-orm";

const BUCKET_LABELS: Record<string, string> = {
  sponsorship: "Sponsorship",
  auction: "Auction",
  vendors: "Vendors",
  attractions: "Attractions",
  marketing: "Marketing",
  build: "Build",
};

export default async function TasksOverviewPage() {
  // Get counts per bucket in one query
  const bucketCounts = await db
    .select({
      bucket: tasks.bucket,
      total: sql<number>`count(*)`,
      open: sql<number>`count(*) filter (where ${tasks.status} != 'done')`,
      done: sql<number>`count(*) filter (where ${tasks.status} = 'done')`,
    })
    .from(tasks)
    .groupBy(tasks.bucket);

  // Build a map for easy lookup
  const countMap = new Map(
    bucketCounts.map((row) => [
      row.bucket,
      { total: Number(row.total), open: Number(row.open), done: Number(row.done) },
    ])
  );

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-[900px]">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-rust-deep mb-1">
        All workstreams
      </p>
      <h1 className="font-display font-bold text-4xl lg:text-5xl text-ink mb-8">
        Tasks
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(BUCKET_LABELS).map(([bucket, label]) => {
          const counts = countMap.get(bucket) ?? { total: 0, open: 0, done: 0 };
          return (
            <Link
              key={bucket}
              href={`/admin/tasks/${bucket}`}
              className="bg-bone border border-ink p-5 hover:shadow-[0_4px_20px_rgba(26,26,26,0.12)] hover:-translate-y-0.5 transition-all"
            >
              <h2 className="font-display text-2xl text-ink mb-3">{label}</h2>
              <div className="flex gap-4">
                <div>
                  <p className="font-display text-3xl text-ink leading-none">
                    {counts.open}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-moss">
                    open
                  </p>
                </div>
                <div>
                  <p className="font-display text-3xl text-forest leading-none">
                    {counts.done}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-moss">
                    done
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
