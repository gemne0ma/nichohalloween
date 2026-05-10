"use client";

import { useState, useTransition } from "react";
import { createVendor, updateVendor, deleteVendor } from "./actions";
import { formatCents } from "@/lib/bundles";

type Vendor = {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  category: string | null;
  quotedAmount: number | null;
  booked: boolean;
  paid: boolean;
  invoiceUrl: string | null;
  notes: string | null;
};

export default function VendorRegister({ vendors: initialVendors }: { vendors: Vendor[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createVendor(formData);
      setShowCreate(false);
    });
  }

  function handleDelete(vendorId: string) {
    if (!confirm("Delete this vendor? This can't be undone.")) return;
    startTransition(async () => {
      await deleteVendor(vendorId);
    });
  }

  async function handleUpdate(vendorId: string, formData: FormData) {
    const quotedRaw = formData.get("quotedAmount") as string;
    startTransition(async () => {
      await updateVendor(vendorId, {
        name: formData.get("name") as string,
        contactName: (formData.get("contactName") as string) || null,
        email: (formData.get("email") as string) || null,
        phone: (formData.get("phone") as string) || null,
        category: (formData.get("category") as string) || null,
        quotedAmount: quotedRaw ? Math.round(parseFloat(quotedRaw) * 100) : null,
        booked: formData.get("booked") === "on",
        paid: formData.get("paid") === "on",
        invoiceUrl: (formData.get("invoiceUrl") as string) || null,
        notes: (formData.get("notes") as string) || null,
      });
      setEditingId(null);
    });
  }

  const booked = initialVendors.filter((v) => v.booked);
  const unbooked = initialVendors.filter((v) => !v.booked);
  const totalQuoted = initialVendors.reduce((sum, v) => sum + (v.quotedAmount ?? 0), 0);
  const totalBooked = booked.reduce((sum, v) => sum + (v.quotedAmount ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-rust-deep mb-1">Register</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-ink">Vendors</h1>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="font-mono text-xs uppercase tracking-[0.3em] bg-forest-deep text-bone px-5 py-2.5 hover:bg-rust transition-colors"
        >
          {showCreate ? "Cancel" : "+ Add vendor"}
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">Total vendors</p>
          <p className="font-display text-2xl text-ink">{initialVendors.length}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">Booked</p>
          <p className="font-display text-2xl text-forest">{booked.length}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">Total quoted</p>
          <p className="font-display text-2xl text-ink">{formatCents(totalQuoted)}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">Booked value</p>
          <p className="font-display text-2xl text-forest">{formatCents(totalBooked)}</p>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <form action={handleCreate} className="bg-bone border border-ink p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Vendor name *</label>
              <input name="name" required className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest" />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Contact name</label>
              <input name="contactName" className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest" />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Email</label>
              <input name="email" type="email" className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest" />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Phone</label>
              <input name="phone" className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest" />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Category</label>
              <input name="category" placeholder="e.g. Food, Entertainment, Lighting" className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest" />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Quoted amount ($)</label>
              <input name="quotedAmount" type="number" step="0.01" min="0" placeholder="0.00" className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest" />
            </div>
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Notes</label>
            <textarea name="notes" rows={2} className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest resize-none" />
          </div>
          <button type="submit" disabled={isPending} className="font-mono text-xs uppercase tracking-[0.3em] bg-forest-deep text-bone px-5 py-2.5 hover:bg-rust transition-colors disabled:opacity-50">
            {isPending ? "Saving..." : "Save vendor"}
          </button>
        </form>
      )}

      {/* Vendor list */}
      <div className="bg-bone border border-ink">
        <div className="px-5 py-4 border-b border-mist">
          <h2 className="font-display text-xl text-ink">All vendors ({initialVendors.length})</h2>
        </div>

        {initialVendors.length === 0 ? (
          <div className="px-5 py-6">
            <p className="font-body text-base italic text-moss">No vendors added yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-dotted divide-mist">
            {initialVendors.map((vendor) =>
              editingId === vendor.id ? (
                <VendorEditRow
                  key={vendor.id}
                  vendor={vendor}
                  isPending={isPending}
                  onSave={(formData) => handleUpdate(vendor.id, formData)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <VendorRow
                  key={vendor.id}
                  vendor={vendor}
                  isPending={isPending}
                  onEdit={() => setEditingId(vendor.id)}
                  onDelete={() => handleDelete(vendor.id)}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function VendorRow({ vendor, isPending, onEdit, onDelete }: {
  vendor: Vendor; isPending: boolean; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div className="px-5 py-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-body text-base text-ink font-semibold">{vendor.name}</p>
            {vendor.category && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-moss">{vendor.category}</span>
            )}
          </div>
          {vendor.contactName && (
            <p className="font-body text-sm text-moss">{vendor.contactName}{vendor.email ? ` · ${vendor.email}` : ""}{vendor.phone ? ` · ${vendor.phone}` : ""}</p>
          )}
          {vendor.notes && <p className="font-body text-sm text-moss italic mt-0.5">{vendor.notes}</p>}
        </div>

        {vendor.quotedAmount != null && (
          <span className="font-mono text-sm text-ink flex-shrink-0">{formatCents(vendor.quotedAmount)}</span>
        )}

        {/* Status pills */}
        <span className={`font-mono text-xs px-2 py-0.5 rounded flex-shrink-0 ${
          vendor.booked ? "bg-forest/20 text-forest" : "bg-paper-deep text-ink-soft"
        }`}>
          {vendor.booked ? "Booked" : "Pending"}
        </span>
        {vendor.booked && (
          <span className={`font-mono text-xs px-2 py-0.5 rounded flex-shrink-0 ${
            vendor.paid ? "bg-forest/20 text-forest" : "bg-rust/20 text-rust-deep"
          }`}>
            {vendor.paid ? "Paid" : "Unpaid"}
          </span>
        )}

        <button onClick={onEdit} className="font-mono text-xs text-moss hover:text-ink transition-colors flex-shrink-0 py-2 px-2">Edit</button>
        <button onClick={onDelete} disabled={isPending} className="font-mono text-xs text-mist hover:text-rust transition-colors flex-shrink-0 py-2 px-2">×</button>
      </div>
    </div>
  );
}

function VendorEditRow({ vendor, isPending, onSave, onCancel }: {
  vendor: Vendor; isPending: boolean; onSave: (formData: FormData) => void; onCancel: () => void;
}) {
  return (
    <form action={onSave} className="px-5 py-4 bg-paper-deep space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Vendor name</label>
          <input name="name" defaultValue={vendor.name} required className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest" />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Contact</label>
          <input name="contactName" defaultValue={vendor.contactName ?? ""} className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest" />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Email</label>
          <input name="email" type="email" defaultValue={vendor.email ?? ""} className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest" />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Phone</label>
          <input name="phone" defaultValue={vendor.phone ?? ""} className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest" />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Category</label>
          <input name="category" defaultValue={vendor.category ?? ""} className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest" />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Quoted ($)</label>
          <input name="quotedAmount" type="number" step="0.01" min="0" defaultValue={vendor.quotedAmount != null ? (vendor.quotedAmount / 100).toFixed(2) : ""} className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest" />
        </div>
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Invoice URL</label>
        <input name="invoiceUrl" defaultValue={vendor.invoiceUrl ?? ""} className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest" />
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="booked" defaultChecked={vendor.booked} className="accent-forest w-4 h-4" />
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Booked</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="paid" defaultChecked={vendor.paid} className="accent-forest w-4 h-4" />
          <span className="font-mono text-xs uppercase tracking-wider text-ink">Paid</span>
        </label>
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Notes</label>
        <textarea name="notes" defaultValue={vendor.notes ?? ""} rows={2} className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest resize-none" />
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
