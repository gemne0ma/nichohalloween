"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatCents } from "@/lib/bundles";
import { resendConfirmationEmail } from "./actions";

type Order = {
  id: string;
  orderNumber: string;
  purchaserName: string;
  purchaserEmail: string;
  bundleType: string;
  tokensPurchased: number;
  amountPaid: number;
  createdAt: string;
};

export default function OrdersList({
  orders,
  currentSearch,
}: {
  orders: Order[];
  currentSearch: string;
}) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendResult, setResendResult] = useState<{ orderId: string; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleResend(orderId: string) {
    setResendingId(orderId);
    setResendResult(null);
    startTransition(async () => {
      try {
        const result = await resendConfirmationEmail(orderId);
        setResendResult({ orderId, message: `Sent to ${result.email}` });
      } catch {
        setResendResult({ orderId, message: "Failed to send. Check Resend dashboard." });
      }
      setResendingId(null);
    });
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.amountPaid, 0);
  const totalTokens = orders.reduce((sum, o) => sum + o.tokensPurchased, 0);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput.trim()) params.set("q", searchInput.trim());
    router.push(`/admin/orders${params.toString() ? `?${params}` : ""}`);
  }

  function handleExportCSV() {
    // Build CSV in the browser from current data
    const headers = ["Order Number", "Name", "Email", "Bundle", "Tokens", "Amount Paid ($)", "Date"];
    const rows = orders.map((o) => [
      o.orderNumber,
      `"${o.purchaserName.replace(/"/g, '""')}"`,
      o.purchaserEmail,
      o.bundleType,
      String(o.tokensPurchased),
      (o.amountPaid / 100).toFixed(2),
      new Date(o.createdAt).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nicho-halloween-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-rust-deep mb-1">
            Register
          </p>
          <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-ink">
            Token orders
          </h1>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={orders.length === 0}
          className="font-mono text-xs uppercase tracking-[0.3em] bg-forest-deep text-bone px-5 py-2.5 hover:bg-rust transition-colors disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">
            Total orders
          </p>
          <p className="font-display text-2xl text-ink">{orders.length}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">
            Total tokens
          </p>
          <p className="font-display text-2xl text-ink">{totalTokens}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">
            Revenue
          </p>
          <p className="font-display text-2xl text-forest">
            {formatCents(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, or order number..."
            className="flex-1 bg-bone border border-ink px-4 py-2.5 font-body text-base text-ink focus:outline-none focus:border-forest placeholder:text-mist"
          />
          <button
            type="submit"
            className="font-mono text-xs uppercase tracking-[0.2em] bg-forest-deep text-bone px-5 py-2.5 hover:bg-rust transition-colors"
          >
            Search
          </button>
          {currentSearch && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                router.push("/admin/orders");
              }}
              className="font-mono text-xs uppercase tracking-[0.2em] text-moss hover:text-ink transition-colors px-4 py-2.5"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Orders table */}
      <div className="bg-bone border border-ink">
        <div className="px-5 py-4 border-b border-mist">
          <h2 className="font-display text-xl text-ink">
            {currentSearch
              ? `Results for "${currentSearch}" (${orders.length})`
              : `All orders (${orders.length})`}
          </h2>
        </div>

        {orders.length === 0 ? (
          <div className="px-5 py-6">
            <p className="font-body text-base italic text-moss">
              {currentSearch
                ? "No orders match that search."
                : "No orders yet. Token sales open in September."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dotted divide-mist">
            {orders.map((order) => (
              <div key={order.id} className="px-3 md:px-5 py-3">
                <div className="flex flex-wrap md:flex-nowrap items-start gap-2 md:gap-4">
                  <div className="flex-shrink-0">
                    <p className="font-mono text-sm text-ink font-bold">
                      {order.orderNumber}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-moss">
                      {new Date(order.createdAt).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm md:text-base text-ink">
                      {order.purchaserName}
                    </p>
                    <p className="font-mono text-[10px] md:text-xs text-moss truncate">
                      {order.purchaserEmail}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-display text-base md:text-lg text-ink">
                      {order.tokensPurchased} tokens
                    </p>
                    <p className="font-mono text-sm text-forest font-bold">
                      {formatCents(order.amountPaid)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleResend(order.id)}
                    disabled={isPending && resendingId === order.id}
                    className="font-mono text-xs text-moss hover:text-rust transition-colors flex-shrink-0 self-center py-2 px-2"
                    title="Resend confirmation email"
                  >
                    {resendingId === order.id ? "Sending..." : "Resend"}
                  </button>
                </div>
                {resendResult?.orderId === order.id && (
                  <p className={`font-mono text-xs mt-1 ${resendResult.message.startsWith("Sent") ? "text-forest" : "text-rust"}`}>
                    {resendResult.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Print hint */}
      {orders.length > 0 && (
        <p className="font-mono text-xs text-moss mt-4">
          Export CSV and print on festival morning for the token booth checklist.
        </p>
      )}
    </div>
  );
}
