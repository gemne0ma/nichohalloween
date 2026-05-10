import { currentUser } from "@clerk/nextjs/server";
import { formatCents } from "@/lib/bundles";
import DashboardCountdown from "./components/DashboardCountdown";
import {
  getTokenStats,
  getSponsorStats,
  getTaskStats,
  getAuctionStats,
  getLatestOrders,
  getSponsorPipeline,
  getVendorPaymentsDue,
  getMoneyRaised,
  getUpcomingTasks,
} from "./queries";

type TaskStatus = "todo" | "in_progress" | "blocked" | "done";

const statusClasses: Record<TaskStatus, string> = {
  todo: "bg-paper-deep text-ink-soft",
  in_progress: "bg-pumpkin/20 text-rust-deep",
  blocked: "bg-rust/20 text-rust-deep",
  done: "bg-forest/20 text-forest line-through",
};

const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  blocked: "Blocked",
  done: "Done",
};

const KEY_DATES = [
  { label: "Sponsors locked", date: "31 Aug" },
  { label: "Token sales open", date: "1 Sep" },
  { label: "Auction items in", date: "15 Sep" },
  { label: "Bump-in week", date: "19 Oct" },
  { label: "Festival day", date: "24 Oct", highlight: true },
];

export default async function AdminDashboard() {
  const user = await currentUser();
  const firstName = user?.firstName || "there";

  const [
    tokenStats, sponsorStats, taskStats, auctionStats,
    latestOrders, sponsorPipeline, vendorPayments, moneyRaised, upcomingTasks,
  ] = await Promise.all([
    getTokenStats(), getSponsorStats(), getTaskStats(), getAuctionStats(),
    getLatestOrders(), getSponsorPipeline(), getVendorPaymentsDue(),
    getMoneyRaised(), getUpcomingTasks(),
  ]);

  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const STAT_TILES = [
    {
      label: "Token revenue",
      value: formatCents(tokenStats.totalRevenue),
      note: `${tokenStats.totalOrders} orders, ${tokenStats.totalTokens} tokens`,
      noteClass: "",
    },
    {
      label: "Sponsors",
      value: `${sponsorStats.count}`,
      note: `${formatCents(sponsorStats.totalCommitted)} committed`,
      noteClass: "",
    },
    {
      label: "Tasks open",
      value: String(taskStats.open),
      note: taskStats.overdue > 0
        ? `${taskStats.overdue} overdue`
        : taskStats.dueThisWeek > 0
          ? `${taskStats.dueThisWeek} due this week`
          : "All on track",
      noteClass: taskStats.overdue > 0 ? "text-rust" : "",
    },
    {
      label: "Auction items",
      value: `${auctionStats.received} / ${auctionStats.total}`,
      note: auctionStats.total === 0 ? "None added yet" : `${auctionStats.total} registered`,
      noteClass: "",
    },
  ];

  const unpaidVendors = vendorPayments.filter((v) => v.booked && !v.paid);
  const totalVendorsDue = unpaidVendors.reduce(
    (sum, v) => sum + (v.quotedAmount ?? 0), 0
  );

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-[1200px]">
      <div className="flex items-start justify-between mb-6 md:mb-8">
        <div>
          <p className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-moss mb-2">{today}</p>
          <h1 className="font-display font-bold text-3xl md:text-5xl lg:text-6xl text-ink">Hey, {firstName}</h1>
        </div>
        <DashboardCountdown />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {STAT_TILES.map((stat) => (
          <div key={stat.label} className="bg-bone border border-ink p-3 md:p-5">
            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.25em] text-moss mb-1 md:mb-2">{stat.label}</p>
            <p className="font-display text-2xl md:text-4xl text-ink leading-none mb-1 md:mb-2">{stat.value}</p>
            <p className={`font-mono text-xs uppercase tracking-wider ${stat.noteClass || "text-moss"}`}>{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-8">
        <div className="space-y-6">
          <DashCard title="Upcoming tasks" linkHref="/admin/tasks/sponsorship" linkLabel="View all">
            {upcomingTasks.length === 0 ? (
              <EmptyState text="No open tasks. Add some from the workstream boards." />
            ) : (
              <div className="divide-y divide-dotted divide-mist">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center px-5 py-3">
                    <p className={`font-body text-base ${task.status === "done" ? "text-moss line-through" : "text-ink"}`}>{task.title}</p>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-moss">{task.bucket}</span>
                    <span className={`font-mono text-xs px-2 py-0.5 rounded ${statusClasses[task.status as TaskStatus]}`}>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString("en-AU", { day: "numeric", month: "short" })
                        : statusLabels[task.status as TaskStatus]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </DashCard>

          <DashCard title="Payments due" badge={totalVendorsDue > 0 ? `${formatCents(totalVendorsDue)} outstanding` : undefined}>
            {unpaidVendors.length === 0 ? (
              <EmptyState text="No outstanding vendor payments." />
            ) : (
              <div className="divide-y divide-dotted divide-mist">
                {unpaidVendors.map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between px-5 py-3">
                    <span className="font-body text-base text-ink">{vendor.name}</span>
                    <span className="font-mono text-base text-rust">{vendor.quotedAmount ? formatCents(vendor.quotedAmount) : "TBC"}</span>
                  </div>
                ))}
              </div>
            )}
          </DashCard>
        </div>

        <div className="space-y-6">
          <DashCard title="Latest orders" linkHref="/admin/orders" linkLabel="View all">
            {latestOrders.length === 0 ? (
              <EmptyState text="No orders yet." />
            ) : (
              <div className="divide-y divide-dotted divide-mist">
                {latestOrders.map((order) => (
                  <div key={order.orderNumber} className="px-5 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-moss">{order.orderNumber}</span>
                      <span className="font-mono text-sm text-ink font-bold">{formatCents(order.amountPaid)}</span>
                    </div>
                    <p className="font-body text-sm text-ink mt-0.5">{order.purchaserName} &middot; {order.tokensPurchased} tokens</p>
                  </div>
                ))}
              </div>
            )}
          </DashCard>

          <DashCard title="Sponsors" linkHref="/admin/sponsors" linkLabel="Manage">
            {sponsorPipeline.length === 0 ? (
              <EmptyState text="No sponsors added yet." />
            ) : (
              <div className="divide-y divide-dotted divide-mist">
                {sponsorPipeline.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <span className="font-body text-base text-ink">{s.businessName}</span>
                      {s.tier && <span className="font-mono text-[10px] uppercase tracking-wider text-moss ml-2">{s.tier}</span>}
                    </div>
                    <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                      s.paidAmount && s.paidAmount > 0 ? "bg-forest/20 text-forest"
                        : s.committedAmount && s.committedAmount > 0 ? "bg-pumpkin/20 text-rust-deep"
                        : "bg-paper-deep text-ink-soft"
                    }`}>
                      {s.paidAmount && s.paidAmount > 0 ? "Paid" : s.committedAmount && s.committedAmount > 0 ? "Committed" : "Pipeline"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </DashCard>

          <DashCard title="Money raised">
            <div className="divide-y divide-dotted divide-mist">
              <DashRow label="Token pre-sales" value={formatCents(moneyRaised.tokenRevenue)} />
              <DashRow label="Sponsorships" value={formatCents(moneyRaised.sponsorRevenue)} />
              <DashRow label="Silent auction" value="External" italic />
              <div className="flex items-center justify-between px-5 py-3 border-t border-ink">
                <span className="font-body text-base text-ink font-semibold">Total</span>
                <span className="font-mono text-base text-forest font-bold">{formatCents(moneyRaised.total)}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="font-body text-base text-ink font-semibold">Goal</span>
                <span className="font-mono text-base text-forest font-bold">$50,000</span>
              </div>
            </div>
          </DashCard>

          <DashCard title="Key dates">
            <div className="divide-y divide-dotted divide-mist">
              {KEY_DATES.map((d) => (
                <div key={d.label} className="flex items-center justify-between px-5 py-3">
                  <span className="font-body text-base text-ink">{d.label}</span>
                  <span className={`font-mono text-xs uppercase tracking-wider ${d.highlight ? "text-rust font-bold" : "text-moss"}`}>{d.date}</span>
                </div>
              ))}
            </div>
          </DashCard>
        </div>
      </div>
    </div>
  );
}

function DashCard({ title, linkHref, linkLabel, badge, children }: {
  title: string; linkHref?: string; linkLabel?: string; badge?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-bone border border-ink">
      <div className="flex items-center justify-between px-5 py-4 border-b border-mist">
        <h2 className="font-display text-xl text-ink">{title}</h2>
        {badge && <span className="font-mono text-xs uppercase tracking-wider text-rust">{badge}</span>}
        {linkHref && <a href={linkHref} className="font-mono text-xs uppercase tracking-wider text-rust hover:text-rust-deep transition-colors">{linkLabel}</a>}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="px-5 py-6"><p className="font-body text-base italic text-moss">{text}</p></div>;
}

function DashRow({ label, value, italic }: { label: string; value: string; italic?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="font-body text-base text-ink">{label}</span>
      <span className={`font-mono text-base ${italic ? "text-moss italic" : "text-ink"}`}>{value}</span>
    </div>
  );
}
