"use client";

import { useState, useTransition } from "react";
import { createAuctionItem, updateAuctionItem, deleteAuctionItem } from "./actions";
import { formatCents } from "@/lib/bundles";

type AuctionStatus = "pending" | "received" | "listed" | "sold";

type AuctionItem = {
  id: string;
  itemName: string;
  classroom: string | null;
  donor: string | null;
  estimatedValue: number | null;
  status: AuctionStatus;
  platformListingUrl: string | null;
  notes: string | null;
};

const STATUS_OPTIONS: { value: AuctionStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "received", label: "Received" },
  { value: "listed", label: "Listed" },
  { value: "sold", label: "Sold" },
];

const statusClasses: Record<AuctionStatus, string> = {
  pending: "bg-paper-deep text-ink-soft",
  received: "bg-pumpkin/20 text-rust-deep",
  listed: "bg-forest/20 text-forest",
  sold: "bg-forest/30 text-forest",
};

export default function AuctionRegister({ items: initialItems }: { items: AuctionItem[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createAuctionItem(formData);
      setShowCreate(false);
    });
  }

  function handleDelete(itemId: string) {
    if (!confirm("Delete this auction item? This can't be undone.")) return;
    startTransition(async () => {
      await deleteAuctionItem(itemId);
    });
  }

  async function handleUpdate(itemId: string, formData: FormData) {
    const estimatedRaw = formData.get("estimatedValue") as string;
    startTransition(async () => {
      await updateAuctionItem(itemId, {
        itemName: formData.get("itemName") as string,
        classroom: (formData.get("classroom") as string) || null,
        donor: (formData.get("donor") as string) || null,
        estimatedValue: estimatedRaw ? Math.round(parseFloat(estimatedRaw) * 100) : null,
        status: formData.get("status") as AuctionStatus,
        platformListingUrl: (formData.get("platformListingUrl") as string) || null,
        notes: (formData.get("notes") as string) || null,
      });
      setEditingId(null);
    });
  }

  const totalValue = initialItems.reduce((sum, item) => sum + (item.estimatedValue ?? 0), 0);
  const received = initialItems.filter((i) => i.status !== "pending").length;

  // Group by classroom
  const classrooms = new Map<string, AuctionItem[]>();
  for (const item of initialItems) {
    const key = item.classroom || "No classroom";
    if (!classrooms.has(key)) classrooms.set(key, []);
    classrooms.get(key)!.push(item);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-rust-deep mb-1">Register</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-ink">Auction items</h1>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="font-mono text-xs uppercase tracking-[0.3em] bg-forest-deep text-bone px-5 py-2.5 hover:bg-rust transition-colors"
        >
          {showCreate ? "Cancel" : "+ Add item"}
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">Total items</p>
          <p className="font-display text-2xl text-ink">{initialItems.length}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">Received</p>
          <p className="font-display text-2xl text-forest">{received}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">Classrooms</p>
          <p className="font-display text-2xl text-ink">{classrooms.size}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">Est. total value</p>
          <p className="font-display text-2xl text-ink">{formatCents(totalValue)}</p>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <form action={handleCreate} className="bg-bone border border-ink p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Item name *</label>
              <input name="itemName" required className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest" />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Classroom</label>
              <input name="classroom" placeholder="e.g. KH, 1/2M, 3/4S" className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest" />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Donor</label>
              <input name="donor" className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest" />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Estimated value ($)</label>
              <input name="estimatedValue" type="number" step="0.01" min="0" placeholder="0.00" className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest" />
            </div>
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Notes</label>
            <textarea name="notes" rows={2} className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest resize-none" />
          </div>
          <button type="submit" disabled={isPending} className="font-mono text-xs uppercase tracking-[0.3em] bg-forest-deep text-bone px-5 py-2.5 hover:bg-rust transition-colors disabled:opacity-50">
            {isPending ? "Saving..." : "Save item"}
          </button>
        </form>
      )}

      {/* Items list */}
      <div className="bg-bone border border-ink">
        <div className="px-5 py-4 border-b border-mist">
          <h2 className="font-display text-xl text-ink">All items ({initialItems.length})</h2>
        </div>

        {initialItems.length === 0 ? (
          <div className="px-5 py-6">
            <p className="font-body text-base italic text-moss">No auction items added yet. Each classroom contributes a hamper or experience.</p>
          </div>
        ) : (
          <div className="divide-y divide-dotted divide-mist">
            {initialItems.map((item) =>
              editingId === item.id ? (
                <ItemEditRow
                  key={item.id}
                  item={item}
                  isPending={isPending}
                  onSave={(formData) => handleUpdate(item.id, formData)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <ItemRow
                  key={item.id}
                  item={item}
                  isPending={isPending}
                  onEdit={() => setEditingId(item.id)}
                  onDelete={() => handleDelete(item.id)}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ItemRow({ item, isPending, onEdit, onDelete }: {
  item: AuctionItem; isPending: boolean; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div className="px-5 py-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-body text-base text-ink font-semibold">{item.itemName}</p>
            {item.classroom && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-moss">{item.classroom}</span>
            )}
          </div>
          {item.donor && <p className="font-body text-sm text-moss">Donated by {item.donor}</p>}
          {item.notes && <p className="font-body text-sm text-moss italic mt-0.5">{item.notes}</p>}
        </div>

        {item.estimatedValue != null && (
          <span className="font-mono text-sm text-ink flex-shrink-0">{formatCents(item.estimatedValue)}</span>
        )}

        <span className={`font-mono text-xs px-2 py-0.5 rounded flex-shrink-0 ${statusClasses[item.status]}`}>
          {STATUS_OPTIONS.find((o) => o.value === item.status)?.label}
        </span>

        {item.platformListingUrl && (
          <a href={item.platformListingUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-rust hover:text-rust-deep transition-colors flex-shrink-0 py-2 px-2">
            Listing
          </a>
        )}

        <button onClick={onEdit} className="font-mono text-xs text-moss hover:text-ink transition-colors flex-shrink-0 py-2 px-2">Edit</button>
        <button onClick={onDelete} disabled={isPending} className="font-mono text-xs text-mist hover:text-rust transition-colors flex-shrink-0 py-2 px-2">×</button>
      </div>
    </div>
  );
}

function ItemEditRow({ item, isPending, onSave, onCancel }: {
  item: AuctionItem; isPending: boolean; onSave: (formData: FormData) => void; onCancel: () => void;
}) {
  return (
    <form action={onSave} className="px-5 py-4 bg-paper-deep space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Item name</label>
          <input name="itemName" defaultValue={item.itemName} required className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest" />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Classroom</label>
          <input name="classroom" defaultValue={item.classroom ?? ""} className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest" />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Donor</label>
          <input name="donor" defaultValue={item.donor ?? ""} className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest" />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Estimated value ($)</label>
          <input name="estimatedValue" type="number" step="0.01" min="0" defaultValue={item.estimatedValue != null ? (item.estimatedValue / 100).toFixed(2) : ""} className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Status</label>
          <select name="status" defaultValue={item.status} className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest">
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Platform listing URL</label>
          <input name="platformListingUrl" defaultValue={item.platformListingUrl ?? ""} placeholder="32auctions or Galabid URL" className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest" />
        </div>
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Notes</label>
        <textarea name="notes" defaultValue={item.notes ?? ""} rows={2} className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest resize-none" />
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={isPending} className="font-mono text-xs uppercase tracking-[0.2em] bg-forest-deep text-bone px-4 py-2 hover:bg-rust transition-colors disabled:opacity-50">
          {isPending ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="font-mono text-xs uppercase tracking-[0.2em] text-moss hover:text-ink transition-colors px-4 py-2">Cancel</button>
      </div>
    </form>
  );
}
