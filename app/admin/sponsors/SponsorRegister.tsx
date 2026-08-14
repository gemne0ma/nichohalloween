"use client";

import { useState, useTransition } from "react";
import { createSponsor, updateSponsor, deleteSponsor } from "./actions";
import { formatCents } from "@/lib/bundles";
import ImageUpload from "@/app/admin/components/ImageUpload";

type SponsorTier = "gold" | "silver" | "bronze" | null;

type Sponsor = {
  id: string;
  businessName: string;
  contact: string | null;
  email: string | null;
  tier: SponsorTier;
  committedAmount: number | null;
  paidAmount: number | null;
  logoUrl: string | null;
  thanked: boolean;
  notes: string | null;
};

const TIER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "No tier" },
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "bronze", label: "Bronze" },
];

const tierClasses: Record<string, string> = {
  gold: "bg-pumpkin/20 text-rust-deep",
  silver: "bg-mist/30 text-ink-soft",
  bronze: "bg-rust/15 text-rust-deep",
};

export default function SponsorRegister({ sponsors: initialSponsors }: { sponsors: Sponsor[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [createLogoUrl, setCreateLogoUrl] = useState<string | null>(null);

  async function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createSponsor(formData);
      setShowCreate(false);
    });
  }

  function handleDelete(sponsorId: string) {
    if (!confirm("Delete this sponsor? This can't be undone.")) return;
    startTransition(async () => {
      await deleteSponsor(sponsorId);
    });
  }

  async function handleUpdate(sponsorId: string, formData: FormData) {
    const committedRaw = formData.get("committedAmount") as string;
    const paidRaw = formData.get("paidAmount") as string;
    const tierVal = formData.get("tier") as string;

    startTransition(async () => {
      await updateSponsor(sponsorId, {
        businessName: formData.get("businessName") as string,
        contact: (formData.get("contact") as string) || null,
        email: (formData.get("email") as string) || null,
        tier: tierVal ? (tierVal as "gold" | "silver" | "bronze") : null,
        committedAmount: committedRaw ? Math.round(parseFloat(committedRaw) * 100) : null,
        paidAmount: paidRaw ? Math.round(parseFloat(paidRaw) * 100) : null,
        logoUrl: (formData.get("logoUrl") as string) || null,
        thanked: formData.get("thanked") === "on",
        notes: (formData.get("notes") as string) || null,
      });
      setEditingId(null);
    });
  }

  const totalCommitted = initialSponsors.reduce((sum, s) => sum + (s.committedAmount ?? 0), 0);
  const totalPaid = initialSponsors.reduce((sum, s) => sum + (s.paidAmount ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-rust-deep mb-1">Register</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-ink">Sponsors</h1>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="font-mono text-xs uppercase tracking-[0.3em] bg-forest-deep text-bone px-5 py-2.5 hover:bg-rust transition-colors"
        >
          {showCreate ? "Cancel" : "+ Add sponsor"}
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">Total sponsors</p>
          <p className="font-display text-2xl text-ink">{initialSponsors.length}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">Committed</p>
          <p className="font-display text-2xl text-ink">{formatCents(totalCommitted)}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">Paid</p>
          <p className="font-display text-2xl text-forest">{formatCents(totalPaid)}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">Outstanding</p>
          <p className="font-display text-2xl text-rust">{formatCents(totalCommitted - totalPaid)}</p>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <form action={handleCreate} className="bg-bone border border-ink p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Business name *</label>
              <input name="businessName" required className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest" />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Contact person</label>
              <input name="contact" className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest" />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Email</label>
              <input name="email" type="email" className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest" />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Tier</label>
              <select name="tier" className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest">
                {TIER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Committed ($)</label>
              <input name="committedAmount" type="number" step="0.01" min="0" placeholder="0.00" className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest" />
            </div>
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Notes</label>
            <textarea name="notes" rows={2} className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest resize-none" />
          </div>
          <ImageUpload
            category="sponsor"
            festivalYear={2026}
            compact
            label="Logo"
            onUploadComplete={({ publicUrl }) => setCreateLogoUrl(publicUrl)}
          />
          <input type="hidden" name="logoUrl" value={createLogoUrl ?? ""} />
          <button type="submit" disabled={isPending} className="font-mono text-xs uppercase tracking-[0.3em] bg-forest-deep text-bone px-5 py-2.5 hover:bg-rust transition-colors disabled:opacity-50">
            {isPending ? "Saving..." : "Save sponsor"}
          </button>
        </form>
      )}

      {/* Sponsor list */}
      <div className="bg-bone border border-ink">
        <div className="px-5 py-4 border-b border-mist">
          <h2 className="font-display text-xl text-ink">All sponsors ({initialSponsors.length})</h2>
        </div>

        {initialSponsors.length === 0 ? (
          <div className="px-5 py-6">
            <p className="font-body text-base italic text-moss">No sponsors added yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-dotted divide-mist">
            {initialSponsors.map((sponsor) =>
              editingId === sponsor.id ? (
                <SponsorEditRow
                  key={sponsor.id}
                  sponsor={sponsor}
                  isPending={isPending}
                  onSave={(formData) => handleUpdate(sponsor.id, formData)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <SponsorRow
                  key={sponsor.id}
                  sponsor={sponsor}
                  isPending={isPending}
                  onEdit={() => setEditingId(sponsor.id)}
                  onDelete={() => handleDelete(sponsor.id)}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SponsorRow({ sponsor, isPending, onEdit, onDelete }: {
  sponsor: Sponsor; isPending: boolean; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div className="px-5 py-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-body text-base text-ink font-semibold">{sponsor.businessName}</p>
            {sponsor.tier && (
              <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${tierClasses[sponsor.tier] ?? "bg-paper-deep text-ink-soft"}`}>
                {sponsor.tier}
              </span>
            )}
          </div>
          {sponsor.contact && (
            <p className="font-body text-sm text-moss">{sponsor.contact}{sponsor.email ? ` · ${sponsor.email}` : ""}</p>
          )}
          {sponsor.notes && <p className="font-body text-sm text-moss italic mt-0.5">{sponsor.notes}</p>}
        </div>

        {/* Amounts */}
        <div className="text-right flex-shrink-0">
          {sponsor.committedAmount != null && sponsor.committedAmount > 0 && (
            <p className="font-mono text-sm text-ink">{formatCents(sponsor.committedAmount)}</p>
          )}
          {sponsor.paidAmount != null && sponsor.paidAmount > 0 && (
            <p className="font-mono text-xs text-forest">{formatCents(sponsor.paidAmount)} paid</p>
          )}
        </div>

        {/* Status pill */}
        <span className={`font-mono text-xs px-2 py-0.5 rounded flex-shrink-0 ${
          sponsor.paidAmount && sponsor.paidAmount > 0 ? "bg-forest/20 text-forest"
          : sponsor.committedAmount && sponsor.committedAmount > 0 ? "bg-pumpkin/20 text-rust-deep"
          : "bg-paper-deep text-ink-soft"
        }`}>
          {sponsor.paidAmount && sponsor.paidAmount > 0 ? "Paid" : sponsor.committedAmount && sponsor.committedAmount > 0 ? "Committed" : "Pipeline"}
        </span>

        {sponsor.thanked && (
          <span className="font-mono text-xs text-forest flex-shrink-0" title="Thanked">✓</span>
        )}

        <button onClick={onEdit} className="font-mono text-xs text-moss hover:text-ink transition-colors flex-shrink-0 py-2 px-2">Edit</button>
        <button onClick={onDelete} disabled={isPending} className="font-mono text-xs text-mist hover:text-rust transition-colors flex-shrink-0 py-2 px-2">×</button>
      </div>
    </div>
  );
}

function SponsorEditRow({ sponsor, isPending, onSave, onCancel }: {
  sponsor: Sponsor; isPending: boolean; onSave: (formData: FormData) => void; onCancel: () => void;
}) {
  const [logoUrl, setLogoUrl] = useState(sponsor.logoUrl ?? "");

  return (
    <form action={onSave} className="px-5 py-4 bg-paper-deep space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Business name</label>
          <input name="businessName" defaultValue={sponsor.businessName} required className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest" />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Contact</label>
          <input name="contact" defaultValue={sponsor.contact ?? ""} className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest" />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Email</label>
          <input name="email" type="email" defaultValue={sponsor.email ?? ""} className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest" />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Tier</label>
          <select name="tier" defaultValue={sponsor.tier ?? ""} className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest">
            {TIER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Committed ($)</label>
          <input name="committedAmount" type="number" step="0.01" min="0" defaultValue={sponsor.committedAmount != null ? (sponsor.committedAmount / 100).toFixed(2) : ""} className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest" />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Paid ($)</label>
          <input name="paidAmount" type="number" step="0.01" min="0" defaultValue={sponsor.paidAmount != null ? (sponsor.paidAmount / 100).toFixed(2) : ""} className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest" />
        </div>
      </div>
      <ImageUpload
        category="sponsor"
        festivalYear={2026}
        compact
        label="Logo"
        existingUrl={sponsor.logoUrl || undefined}
        onUploadComplete={({ publicUrl }) => setLogoUrl(publicUrl)}
      />
      <input type="hidden" name="logoUrl" value={logoUrl} />
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" name="thanked" defaultChecked={sponsor.thanked} className="accent-forest w-4 h-4" />
        <span className="font-mono text-xs uppercase tracking-wider text-ink">Thanked</span>
      </label>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">Notes</label>
        <textarea name="notes" defaultValue={sponsor.notes ?? ""} rows={2} className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest resize-none" />
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
