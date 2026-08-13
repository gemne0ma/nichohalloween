"use client";

import { useEffect, useState, useTransition } from "react";
import {
  createProspect,
  updateProspect,
  updateProspectStatus,
  updateProspectItemValue,
  bulkAddProspects,
  findSimilarProspects,
  type DuplicateMatch,
  type BulkAddResult,
} from "./actions";
import type { ProspectRow, ProspectStatus } from "./queries";

type AdminUser = { id: string; name: string | null; email: string };

const STATUS_OPTIONS: { value: ProspectStatus; label: string }[] = [
  { value: "not_contacted", label: "Not contacted" },
  { value: "contacted", label: "Contacted" },
  { value: "waiting_on_reply", label: "Waiting on reply" },
  { value: "agreed_to_donate", label: "Agreed to donate" },
  { value: "item_received", label: "Item received" },
  { value: "declined", label: "Declined" },
];

// Muted, not traffic lights. Every value is an existing palette token at
// low opacity, so the pills read as a family rather than as warnings.
const statusClasses: Record<ProspectStatus, string> = {
  not_contacted: "bg-paper-deep text-moss",
  contacted: "bg-pumpkin/15 text-rust-deep",
  waiting_on_reply: "bg-mist/30 text-ink-soft",
  agreed_to_donate: "bg-forest/15 text-forest",
  item_received: "bg-forest/25 text-forest-deep",
  declined: "bg-plum/10 text-plum",
};

const PILL_BASE =
  "font-mono text-[10px] uppercase tracking-[0.15em] px-2 py-1 leading-none";

function statusLabel(status: ProspectStatus) {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

// Pipeline order, so sorting by status walks the funnel rather than the
// alphabet.
function statusRank(status: ProspectStatus) {
  return STATUS_OPTIONS.findIndex((o) => o.value === status);
}

// dd/mm/yyyy. Numeric on purpose: tabular-nums only aligns digits, and a
// month name would defeat the column.
function formatDate(d: Date | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// AUD for a table column: thousands separators, cents only when they exist.
// Deliberately not lib/bundles formatCents, which omits separators and would
// render 120000 as "$1200" in a column meant to be scanned.
// Whole dollars get no decimals, part dollars get exactly two. One formatter
// with maximumFractionDigits: 2 would render 45050 as "$450.5".
const AUD_WHOLE = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const AUD_CENTS = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Blank when unknown, and blank at zero. A donated item worth nothing is not
// a thing we want to print as "$0".
function formatAud(cents: number | null): string {
  if (cents == null || cents === 0) return "";
  return cents % 100 === 0
    ? AUD_WHOLE.format(cents / 100)
    : AUD_CENTS.format(cents / 100);
}

// Zero counts as blank everywhere, including sorting, so a row cannot look
// empty and still sort as a number.
function valueOrNull(cents: number | null): number | null {
  return cents == null || cents === 0 ? null : cents;
}

// Raw dollars for the edit input, so the user types 1200 not $1,200.00.
function centsToInput(cents: number | null): string {
  if (cents == null) return "";
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

// null means clear the field. undefined means the input was rubbish, so leave
// the stored value alone rather than wiping it on a typo.
function parseAudToCents(raw: string): number | null | undefined {
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.round(n * 100);
}

type SortKey = "business" | "status" | "itemValue" | "lastChange";
type SortDir = "asc" | "desc";

// Everything the edit form can change. Status is not here: it is edited
// inline from the table, because that write also stamps last_contacted_at.
type EditData = {
  businessName: string;
  suburb: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string | null;
  item: string | null;
  itemValueCents: number | null;
  owner: string | null;
  doNotContact: boolean;
};

const inputClasses =
  "w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest";
const labelClasses =
  "font-mono text-xs uppercase tracking-wider text-moss block mb-1";

export default function ProspectsRegister({
  prospects,
  adminUsers,
}: {
  prospects: ProspectRow[];
  adminUsers: AdminUser[];
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Both filters start at "all" so the first load shows every business.
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterOwner, setFilterOwner] = useState("all");
  const [search, setSearch] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("business");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const hasFilters =
    filterStatus !== "all" || filterOwner !== "all" || search.trim() !== "";

  // Filtering happens here rather than on the server because every row is
  // already on the page. A few hundred businesses is nothing to scan, and
  // it means results appear as you type with no round trip.
  const term = search.trim().toLowerCase();

  const filtered = prospects.filter((p) => {
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (filterOwner === "unassigned" && p.owner) return false;
    if (filterOwner !== "all" && filterOwner !== "unassigned" && p.owner !== filterOwner) {
      return false;
    }
    if (term) {
      const haystack = [
        p.businessName,
        p.suburb,
        p.contactName,
        p.contactEmail,
        p.contactPhone,
        p.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });

  const visible = [...filtered].sort((a, b) => {
    let result = 0;
    if (sortKey === "business") {
      result = a.businessName.localeCompare(b.businessName, "en-AU", {
        sensitivity: "base",
      });
    } else if (sortKey === "status") {
      result = statusRank(a.status) - statusRank(b.status);
      // Same status, so fall back to name for a stable, readable order.
      if (result === 0) result = a.businessName.localeCompare(b.businessName);
    } else if (sortKey === "itemValue") {
      // Blanks always last, whichever direction. Return early so the
      // direction flip below cannot push empty rows to the top.
      const av = valueOrNull(a.itemValueCents);
      const bv = valueOrNull(b.itemValueCents);
      if (av === null && bv === null) {
        return a.businessName.localeCompare(b.businessName);
      }
      if (av === null) return 1;
      if (bv === null) return -1;
      const diff = av - bv;
      return sortDir === "asc" ? diff : -diff;
    } else {
      // Never-touched rows sort last ascending, so the stale ones surface.
      const at = a.lastContactedAt ? new Date(a.lastContactedAt).getTime() : null;
      const bt = b.lastContactedAt ? new Date(b.lastContactedAt).getTime() : null;
      if (at === null && bt === null) result = 0;
      else if (at === null) result = 1;
      else if (bt === null) result = -1;
      else result = at - bt;
    }
    return sortDir === "asc" ? result : -result;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function toggleExpanded(id: string) {
    setExpandedId(expandedId === id ? null : id);
    if (editingId && editingId !== id) setEditingId(null);
  }

  const counts = {
    total: prospects.length,
    agreed: prospects.filter((p) => p.status === "agreed_to_donate").length,
    received: prospects.filter((p) => p.status === "item_received").length,
    declined: prospects.filter((p) => p.status === "declined").length,
    open: prospects.filter(
      (p) =>
        p.status !== "declined" &&
        p.status !== "item_received" &&
        !p.doNotContact
    ).length,
    // Only what has actually been promised or handed over. Anything still
    // being chased is not counted.
    estValueCents: prospects
      .filter(
        (p) => p.status === "agreed_to_donate" || p.status === "item_received"
      )
      .reduce((sum, p) => sum + (p.itemValueCents ?? 0), 0),
  };

  // Exports whatever is currently on screen, so filters and search double as
  // a report builder. Same browser-side approach as the orders register: no
  // route, no library, no data leaving the page that was not already here.
  function handleExportCSV() {
    const esc = (v: string | null) =>
      v == null ? "" : `"${String(v).replace(/"/g, '""')}"`;

    const headers = [
      "Business",
      "Status",
      "Owner",
      "Suburb",
      "Contact name",
      "Contact email",
      "Contact phone",
      "Item",
      "Item value ($)",
      "Do not contact",
      "Notes",
      "Last change",
      "Added by",
      "Added on",
    ];

    const rows = visible.map((p) => [
      esc(p.businessName),
      esc(statusLabel(p.status)),
      esc(p.ownerName),
      esc(p.suburb),
      esc(p.contactName),
      esc(p.contactEmail),
      esc(p.contactPhone),
      esc(p.item),
      p.itemValueCents ? (p.itemValueCents / 100).toFixed(2) : "",
      p.doNotContact ? "YES" : "",
      esc(p.notes),
      p.lastContactedAt ? formatDate(p.lastContactedAt) : "",
      esc(p.createdByName),
      p.createdAt ? formatDate(new Date(p.createdAt)) : "",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nicho-auction-prospects-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleStatusChange(prospectId: string, status: ProspectStatus) {
    startTransition(async () => {
      await updateProspectStatus(prospectId, status);
    });
  }

  function handleValueChange(prospectId: string, cents: number | null) {
    startTransition(async () => {
      await updateProspectItemValue(prospectId, cents);
    });
  }

  return (
    <div>
      <div className="flex items-start justify-end gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          <button
            onClick={() => {
              setShowCreate(!showCreate);
              setShowBulk(false);
            }}
            className="font-mono text-xs uppercase tracking-[0.3em] bg-forest-deep text-bone px-5 py-2.5 hover:bg-rust transition-colors"
          >
            {showCreate ? "Cancel" : "+ Add business"}
          </button>
          <button
            onClick={() => {
              setShowBulk(!showBulk);
              setShowCreate(false);
            }}
            className="font-mono text-xs uppercase tracking-[0.3em] border border-ink text-ink px-5 py-2.5 hover:bg-paper-deep transition-colors"
          >
            {showBulk ? "Cancel" : "Bulk add"}
          </button>
          <button
            onClick={handleExportCSV}
            disabled={visible.length === 0}
            title="Downloads the rows currently shown, filters and search included"
            className="font-mono text-xs uppercase tracking-[0.3em] border border-ink text-ink px-5 py-2.5 hover:bg-paper-deep transition-colors disabled:opacity-40"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">
            Total
          </p>
          <p className="font-display text-2xl text-ink">{counts.total}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">
            Still open
          </p>
          <p className="font-display text-2xl text-ink">{counts.open}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">
            Agreed
          </p>
          <p className="font-display text-2xl text-forest">{counts.agreed}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">
            Received
          </p>
          <p className="font-display text-2xl text-forest">{counts.received}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">
            Declined
          </p>
          <p className="font-display text-2xl text-moss">{counts.declined}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">
            Est. value secured
          </p>
          <p className="font-display text-2xl text-ink tabular-nums">
            {formatAud(counts.estValueCents) || "$0"}
          </p>
          <p className="font-mono text-[9px] uppercase tracking-wider text-mist mt-0.5">
            Estimate. Agreed + received
          </p>
        </div>
      </div>

      {/* Quick search. Filters as you type, no submit. */}
      <div className="relative mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSearch("");
          }}
          placeholder="Search business, suburb, contact or notes..."
          aria-label="Search businesses"
          className="w-full bg-bone border border-ink px-4 py-2.5 pr-20 font-body text-base text-ink focus:outline-none focus:border-forest placeholder:text-mist"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-wider text-moss hover:text-ink transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <label className="font-mono text-[10px] uppercase tracking-wider text-moss">
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-bone border border-mist px-2 py-1.5 font-mono text-xs text-ink focus:outline-none focus:border-forest"
          >
            <option value="all">All</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-mono text-[10px] uppercase tracking-wider text-moss">
            Owner
          </label>
          <select
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
            className="bg-bone border border-mist px-2 py-1.5 font-mono text-xs text-ink focus:outline-none focus:border-forest"
          >
            <option value="all">All</option>
            <option value="unassigned">Unassigned</option>
            {adminUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.email}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={() => {
              setFilterStatus("all");
              setFilterOwner("all");
              setSearch("");
            }}
            className="font-mono text-[10px] uppercase tracking-wider text-rust hover:text-rust-deep transition-colors py-1"
          >
            Clear filters
          </button>
        )}
      </div>

      {showCreate && (
        <CreateForm
          isPending={isPending}
          startTransition={startTransition}
          onDone={() => setShowCreate(false)}
        />
      )}

      {showBulk && (
        <BulkAddForm
          isPending={isPending}
          startTransition={startTransition}
          onDone={() => setShowBulk(false)}
        />
      )}

      {/* List */}
      <div className="bg-bone border border-ink">
        <div className="px-5 py-4 border-b border-ink">
          <h2 className="font-display text-xl text-ink">
            {hasFilters
              ? `Showing ${visible.length} of ${prospects.length}`
              : `All businesses (${prospects.length})`}
          </h2>
        </div>

        {visible.length === 0 ? (
          <div className="px-5 py-6">
            <p className="font-body text-base italic text-moss">
              {prospects.length === 0
                ? "No businesses yet. Add one by name, or paste a list with bulk add."
                : term
                  ? `Nothing matches "${search.trim()}".`
                  : "No businesses match these filters."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table. Its own scroll container, because the admin
                main element is overflow-y-auto without a height, which would
                stop a sticky header from ever engaging. */}
            <div className="hidden md:block max-h-[70vh] overflow-y-auto">
              <table className="w-full border-separate border-spacing-0 text-left">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <SortableHeader
                      label="Business"
                      active={sortKey === "business"}
                      dir={sortDir}
                      onClick={() => toggleSort("business")}
                      className="pl-5"
                    />
                    <SortableHeader
                      label="Status"
                      active={sortKey === "status"}
                      dir={sortDir}
                      onClick={() => toggleSort("status")}
                    />
                    <PlainHeader label="Owner" />
                    <PlainHeader label="Item" />
                    <SortableHeader
                      label="Item value"
                      active={sortKey === "itemValue"}
                      dir={sortDir}
                      onClick={() => toggleSort("itemValue")}
                      className="text-right"
                    />
                    <SortableHeader
                      label="Last change"
                      active={sortKey === "lastChange"}
                      dir={sortDir}
                      onClick={() => toggleSort("lastChange")}
                    />
                    <PlainHeader label="Notes" className="pr-5 text-center" />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((p, i) => (
                    <TableRow
                      key={p.id}
                      prospect={p}
                      isFirst={i === 0}
                      isPending={isPending}
                      isExpanded={expandedId === p.id}
                      isEditing={editingId === p.id}
                      adminUsers={adminUsers}
                      onToggle={() => toggleExpanded(p.id)}
                      onStatusChange={(status) => handleStatusChange(p.id, status)}
                      onValueChange={(cents) => handleValueChange(p.id, cents)}
                      onEditStart={() => setEditingId(p.id)}
                      onEditCancel={() => setEditingId(null)}
                      onEditSave={(data) => {
                        startTransition(async () => {
                          await updateProspect(p.id, data);
                          setEditingId(null);
                        });
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: stacked blocks, no sideways scroll. */}
            <div className="md:hidden">
              {visible.map((p, i) => (
                <MobileCard
                  key={p.id}
                  prospect={p}
                  isFirst={i === 0}
                  isPending={isPending}
                  isExpanded={expandedId === p.id}
                  isEditing={editingId === p.id}
                  adminUsers={adminUsers}
                  onToggle={() => toggleExpanded(p.id)}
                  onStatusChange={(status) => handleStatusChange(p.id, status)}
                  onValueChange={(cents) => handleValueChange(p.id, cents)}
                  onEditStart={() => setEditingId(p.id)}
                  onEditCancel={() => setEditingId(null)}
                  onEditSave={(data) => {
                    startTransition(async () => {
                      await updateProspect(p.id, data);
                      setEditingId(null);
                    });
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <p className="font-body text-sm italic text-moss mt-4">
        Businesses are never deleted. Set a business to Declined to close it
        out, so next year&apos;s committee can see it was already asked.
      </p>
    </div>
  );
}

// ─── Add one business ────────────────────────────────────

function CreateForm({
  isPending,
  startTransition,
  onDone,
}: {
  isPending: boolean;
  startTransition: (cb: () => Promise<void>) => void;
  onDone: () => void;
}) {
  const [businessName, setBusinessName] = useState("");
  const [suburb, setSuburb] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [duplicates, setDuplicates] = useState<DuplicateMatch[] | null>(null);
  const [checking, setChecking] = useState(false);

  function values() {
    return {
      businessName,
      suburb: suburb || null,
      contactName: contactName || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      notes: notes || null,
    };
  }

  function save() {
    startTransition(async () => {
      await createProspect(values());
      onDone();
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim()) return;

    // Warn once. If the user submits again with the warning showing, they
    // have seen it and meant it.
    if (duplicates === null) {
      setChecking(true);
      const matches = await findSimilarProspects(businessName);
      setChecking(false);
      if (matches.length > 0) {
        setDuplicates(matches);
        return;
      }
    }
    save();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-bone border border-ink p-5 mb-6 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Business name *</label>
          <input
            value={businessName}
            onChange={(e) => {
              setBusinessName(e.target.value);
              setDuplicates(null);
            }}
            required
            autoFocus
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>Suburb</label>
          <input
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
            placeholder="e.g. Balmain East"
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>Contact name</label>
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>Contact email</label>
          {/* Plain text, not type=email. Half-remembered addresses and notes
              like "ask at the counter" have to be savable. */}
          <input
            type="text"
            inputMode="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>Contact phone</label>
          <input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>
      <div>
        <label className={labelClasses}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={`${inputClasses} resize-none`}
        />
      </div>

      {duplicates && duplicates.length > 0 && (
        <div className="border border-rust bg-pumpkin/10 p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-rust-deep mb-2">
            Possible duplicate
          </p>
          <ul className="space-y-1 mb-3">
            {duplicates.map((d) => (
              <li key={`${d.source}-${d.id}`} className="font-body text-sm text-ink">
                <span className="font-semibold">{d.businessName}</span>
                {d.source === "sponsor" ? (
                  <span className="text-moss">
                    {" "}
                    &middot; already a sponsor
                    {d.sponsorTier ? ` (${d.sponsorTier})` : ""}
                  </span>
                ) : (
                  <span className="text-moss">
                    {" "}
                    &middot; {d.status ? statusLabel(d.status) : "in outreach"}
                    {d.addedBy ? ` · added by ${d.addedBy}` : ""}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="font-body text-sm italic text-moss">
            Add it anyway if this is a different business. If it is already a
            sponsor, check with whoever owns that relationship before asking
            them for a lot as well.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending || checking || !businessName.trim()}
          className="font-mono text-xs uppercase tracking-[0.3em] bg-forest-deep text-bone px-5 py-2.5 hover:bg-rust transition-colors disabled:opacity-50"
        >
          {checking
            ? "Checking..."
            : isPending
              ? "Saving..."
              : duplicates && duplicates.length > 0
                ? "Add anyway"
                : "Save business"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="font-mono text-xs uppercase tracking-[0.2em] text-moss hover:text-ink transition-colors px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Bulk add ────────────────────────────────────────────

function BulkAddForm({
  isPending,
  startTransition,
  onDone,
}: {
  isPending: boolean;
  startTransition: (cb: () => Promise<void>) => void;
  onDone: () => void;
}) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<BulkAddResult | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    startTransition(async () => {
      const res = await bulkAddProspects(text);
      setResult(res);
      setText("");
    });
  }

  const lineCount = text.split("\n").filter((l) => l.trim()).length;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-bone border border-ink p-5 mb-6 space-y-4"
    >
      <div>
        <label className={labelClasses}>
          Paste a list, one business per line
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          autoFocus
          placeholder={"Balmain Wellness Co\nSea Shaper Studio\nAnnandale Clay Works"}
          className={`${inputClasses} resize-y font-body`}
        />
        <p className="font-mono text-[10px] uppercase tracking-wider text-moss mt-1">
          {lineCount} {lineCount === 1 ? "business" : "businesses"} . added as
          not contacted . near-matches skipped
        </p>
      </div>

      {result && (
        <div className="border border-mist bg-paper p-4">
          <p className="font-body text-sm text-ink">
            Added {result.created}{" "}
            {result.created === 1 ? "business" : "businesses"}
            {result.skipped.length > 0
              ? `. Skipped ${result.skipped.length} that already looked present.`
              : "."}
          </p>

          {result.skipped.length > 0 && (
            <div className="mt-3">
              <p className="font-mono text-xs uppercase tracking-wider text-rust-deep mb-2">
                Skipped as duplicates
              </p>
              <ul className="space-y-1.5">
                {result.skipped.map((s) => (
                  <li key={s.pastedName} className="font-body text-sm text-ink">
                    <span className="font-semibold">{s.pastedName}</span>
                    <span className="text-moss">
                      {" "}
                      matched <span className="italic">{s.matchedName}</span>
                      {" "}
                      &middot; {statusLabel(s.matchedStatus)}
                      {s.matchedAddedBy ? ` · added by ${s.matchedAddedBy}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="font-body text-sm italic text-moss mt-2">
                If any of these is genuinely a different business, add it on its
                own with &quot;+ Add business&quot; and choose Add anyway.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending || !text.trim()}
          className="font-mono text-xs uppercase tracking-[0.3em] bg-forest-deep text-bone px-5 py-2.5 hover:bg-rust transition-colors disabled:opacity-50"
        >
          {isPending ? "Adding..." : "Add all"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="font-mono text-xs uppercase tracking-[0.2em] text-moss hover:text-ink transition-colors px-4 py-2"
        >
          Done
        </button>
      </div>
    </form>
  );
}

// ─── Table headers ───────────────────────────────────────

const TH_BASE =
  "font-mono text-[10px] uppercase tracking-[0.25em] text-moss font-normal py-3 px-3 align-middle bg-bone border-b border-ink";

function PlainHeader({ label, className = "" }: { label: string; className?: string }) {
  return <th className={`${TH_BASE} ${className}`}>{label}</th>;
}

function SortableHeader({
  label,
  active,
  dir,
  onClick,
  className = "",
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  return (
    <th
      className={`${TH_BASE} ${className}`}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        onClick={onClick}
        className={`font-mono text-[10px] uppercase tracking-[0.25em] transition-colors hover:text-ink ${
          active ? "text-ink" : "text-moss"
        }`}
      >
        {label}
        <span className="ml-1 inline-block w-2">
          {active ? (dir === "asc" ? "\u25B4" : "\u25BE") : ""}
        </span>
      </button>
    </th>
  );
}

// ─── Shared row pieces ───────────────────────────────────

// The pill is the control. Wrapper carries the colour so the caret can
// inherit it, select sits transparent on top.
function StatusControl({
  status,
  isPending,
  onChange,
}: {
  status: ProspectStatus;
  isPending: boolean;
  onChange: (status: ProspectStatus) => void;
}) {
  return (
    <span
      className={`relative inline-flex items-center ${PILL_BASE} ${statusClasses[status]}`}
      onClick={(e) => e.stopPropagation()}
    >
      <select
        value={status}
        disabled={isPending}
        onChange={(e) => onChange(e.target.value as ProspectStatus)}
        aria-label="Status"
        className="appearance-none bg-transparent text-inherit font-mono text-[10px] uppercase tracking-[0.15em] pr-4 focus:outline-none focus:underline disabled:opacity-50 cursor-pointer"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-paper text-ink tracking-normal">
            {opt.label}
          </option>
        ))}
      </select>
      <span aria-hidden className="absolute right-1.5 text-[8px] leading-none">
        {"\u25BE"}
      </span>
    </span>
  );
}

// Inline editable money cell. Shows formatted AUD at rest, raw dollars while
// focused, saves on blur or Enter. Same idea as the status pill: edit from
// the table without opening the row.
function ItemValueControl({
  cents,
  isPending,
  onSave,
  align = "right",
}: {
  cents: number | null;
  isPending: boolean;
  onSave: (cents: number | null) => void;
  align?: "right" | "left";
}) {
  const [draft, setDraft] = useState(centsToInput(cents));
  const [focused, setFocused] = useState(false);

  // Keep in step when the row re-renders after a save elsewhere.
  useEffect(() => {
    if (!focused) setDraft(centsToInput(cents));
  }, [cents, focused]);

  function commit() {
    setFocused(false);
    const parsed = parseAudToCents(draft);
    if (parsed === undefined) {
      setDraft(centsToInput(cents)); // rubbish in, nothing changed
      return;
    }
    if (parsed !== cents) onSave(parsed);
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      aria-label="Item value in dollars"
      disabled={isPending}
      value={focused ? draft : formatAud(cents)}
      placeholder="."
      onClick={(e) => e.stopPropagation()}
      onFocus={() => {
        setFocused(true);
        setDraft(centsToInput(cents));
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
        } else if (e.key === "Escape") {
          setDraft(centsToInput(cents));
          setFocused(false);
          (e.target as HTMLInputElement).blur();
        }
      }}
      className={`w-24 bg-transparent border border-transparent hover:border-mist focus:border-forest focus:bg-paper px-2 py-1 font-mono text-xs text-ink-soft tabular-nums placeholder:text-mist focus:outline-none disabled:opacity-50 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    />
  );
}

function NotesDot({ hasNotes }: { hasNotes: boolean }) {
  if (!hasNotes) return <span className="sr-only">No notes</span>;
  return (
    <span
      title="Has notes"
      className="inline-block w-1.5 h-1.5 rounded-full bg-moss align-middle"
    >
      <span className="sr-only">Has notes</span>
    </span>
  );
}

function ExpandedDetails({
  prospect,
  onEditStart,
}: {
  prospect: ProspectRow;
  onEditStart: () => void;
}) {
  const fields: { label: string; value: string | null }[] = [
    { label: "Suburb", value: prospect.suburb },
    { label: "Contact name", value: prospect.contactName },
    { label: "Contact email", value: prospect.contactEmail },
    { label: "Contact phone", value: prospect.contactPhone },
    { label: "Item", value: prospect.item },
    {
      label: "Item value",
      value: formatAud(prospect.itemValueCents) || null,
    },
  ];
  const hasAnyDetail = fields.some((f) => f.value);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {fields.map((f) => (
          <div key={f.label}>
            <p className="font-mono text-[10px] uppercase tracking-wider text-moss mb-0.5">
              {f.label}
            </p>
            <p className="font-body text-sm text-ink break-words">
              {f.value || <span className="text-mist italic">Not recorded</span>}
            </p>
          </div>
        ))}
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-moss mb-0.5">
          Notes
        </p>
        <p className="font-body text-sm text-ink whitespace-pre-wrap">
          {prospect.notes || <span className="text-mist italic">No notes</span>}
        </p>
      </div>

      {!hasAnyDetail && !prospect.notes && (
        <p className="font-body text-sm italic text-moss">
          Nothing recorded yet beyond the name.
        </p>
      )}

      <button
        onClick={onEditStart}
        className="font-mono text-xs uppercase tracking-[0.2em] border border-ink text-ink px-4 py-2 hover:bg-paper-deep transition-colors"
      >
        Edit details
      </button>
    </div>
  );
}

type RowProps = {
  prospect: ProspectRow;
  isFirst: boolean;
  isPending: boolean;
  isExpanded: boolean;
  isEditing: boolean;
  adminUsers: AdminUser[];
  onToggle: () => void;
  onStatusChange: (status: ProspectStatus) => void;
  onValueChange: (cents: number | null) => void;
  onEditStart: () => void;
  onEditCancel: () => void;
  onEditSave: (data: EditData) => void;
};

// ─── Desktop table row ───────────────────────────────────

function TableRow({
  prospect,
  isFirst,
  isPending,
  isExpanded,
  isEditing,
  adminUsers,
  onToggle,
  onStatusChange,
  onValueChange,
  onEditStart,
  onEditCancel,
  onEditSave,
}: RowProps) {
  const cell = `py-[18px] px-3 align-top ${
    isFirst ? "" : "border-t border-dotted border-mist"
  }`;
  const dnc = prospect.doNotContact;
  const lastChange = formatDate(prospect.lastContactedAt);
  const open = isExpanded || isEditing;

  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer transition-colors hover:bg-paper-deep/40 ${
          dnc ? "bg-pumpkin/5" : ""
        }`}
      >
        <td className={`${cell} pl-5 ${dnc ? "border-l-2 border-l-rust" : ""}`}>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span aria-hidden className="font-mono text-[10px] text-mist">
              {open ? "\u25BE" : "\u25B8"}
            </span>
            <span className="font-display text-lg text-ink leading-tight">
              {prospect.businessName}
            </span>
            {dnc && (
              <span className={`${PILL_BASE} bg-rust text-bone`}>
                Do not contact
              </span>
            )}
          </div>
        </td>
        <td className={cell}>
          <StatusControl
            status={prospect.status}
            isPending={isPending}
            onChange={onStatusChange}
          />
        </td>
        <td className={`${cell} font-body text-sm text-ink-soft`}>
          {prospect.ownerName || <span className="text-mist italic">Unassigned</span>}
        </td>
        <td className={`${cell} font-body text-sm text-ink-soft`}>
          {prospect.item || <span className="text-mist">.</span>}
        </td>
        <td className={`${cell} text-right`}>
          <ItemValueControl
            cents={prospect.itemValueCents}
            isPending={isPending}
            onSave={onValueChange}
          />
        </td>
        <td className={`${cell} font-mono text-xs text-ink-soft tabular-nums whitespace-nowrap`}>
          {lastChange || <span className="text-mist">not yet</span>}
        </td>
        <td className={`${cell} pr-5 text-center`}>
          <NotesDot hasNotes={Boolean(prospect.notes)} />
        </td>
      </tr>

      {open && (
        <tr
          className={`${dnc ? "border-l-2 border-l-rust bg-pumpkin/5" : "bg-paper-deep/30"}`}
        >
          <td
            colSpan={7}
            className={`px-5 pb-5 pt-1 ${dnc ? "border-l-2 border-l-rust" : ""}`}
          >
            {isEditing ? (
              <ProspectEditRow
                prospect={prospect}
                adminUsers={adminUsers}
                isPending={isPending}
                onSave={onEditSave}
                onCancel={onEditCancel}
              />
            ) : (
              <ExpandedDetails prospect={prospect} onEditStart={onEditStart} />
            )}
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Mobile stacked card ─────────────────────────────────

function MobileCard({
  prospect,
  isFirst,
  isPending,
  isExpanded,
  isEditing,
  adminUsers,
  onToggle,
  onStatusChange,
  onValueChange,
  onEditStart,
  onEditCancel,
  onEditSave,
}: RowProps) {
  const dnc = prospect.doNotContact;
  const lastChange = formatDate(prospect.lastContactedAt);
  const open = isExpanded || isEditing;

  const pairs: { label: string; value: React.ReactNode }[] = [
    {
      label: "Owner",
      value: prospect.ownerName || <span className="text-mist italic">Unassigned</span>,
    },
    {
      label: "Item",
      value: prospect.item || <span className="text-mist">.</span>,
    },
    {
      label: "Item value",
      value: (
        <ItemValueControl
          cents={prospect.itemValueCents}
          isPending={isPending}
          onSave={onValueChange}
          align="left"
        />
      ),
    },
    {
      label: "Last change",
      value: (
        <span className="tabular-nums">
          {lastChange || <span className="text-mist">not yet</span>}
        </span>
      ),
    },
  ];

  return (
    <div
      className={`px-5 py-4 ${isFirst ? "" : "border-t border-dotted border-mist"} ${
        dnc ? "border-l-2 border-l-rust bg-pumpkin/5" : ""
      }`}
    >
      <div
        onClick={onToggle}
        className="flex items-start justify-between gap-3 cursor-pointer"
      >
        <div className="min-w-0">
          <p className="font-display text-lg text-ink leading-tight break-words">
            {prospect.businessName}
          </p>
          {dnc && (
            <span className={`${PILL_BASE} bg-rust text-bone inline-block mt-1`}>
              Do not contact
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusControl
            status={prospect.status}
            isPending={isPending}
            onChange={onStatusChange}
          />
          <span aria-hidden className="font-mono text-[10px] text-mist">
            {open ? "\u25BE" : "\u25B8"}
          </span>
        </div>
      </div>

      <dl className="mt-3 space-y-1">
        {pairs.map((pair) => (
          <div key={pair.label} className="flex gap-2">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-moss w-24 flex-shrink-0 pt-0.5">
              {pair.label}
            </dt>
            <dd className="font-body text-sm text-ink-soft min-w-0">{pair.value}</dd>
          </div>
        ))}
        <div className="flex gap-2">
          <dt className="font-mono text-[10px] uppercase tracking-wider text-moss w-24 flex-shrink-0 pt-0.5">
            Notes
          </dt>
          <dd className="font-body text-sm text-ink-soft">
            {prospect.notes ? "Yes" : <span className="text-mist">.</span>}
          </dd>
        </div>
      </dl>

      {open && (
        <div className="mt-4 pt-4 border-t border-dotted border-mist">
          {isEditing ? (
            <ProspectEditRow
              prospect={prospect}
              adminUsers={adminUsers}
              isPending={isPending}
              onSave={onEditSave}
              onCancel={onEditCancel}
            />
          ) : (
            <ExpandedDetails prospect={prospect} onEditStart={onEditStart} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Edit row ────────────────────────────────────────────

function ProspectEditRow({
  prospect,
  adminUsers,
  isPending,
  onSave,
  onCancel,
}: {
  prospect: ProspectRow;
  adminUsers: AdminUser[];
  isPending: boolean;
  onSave: (data: EditData) => void;
  onCancel: () => void;
}) {
  const editInput =
    "w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // undefined means unparseable, so keep whatever is already stored.
    const parsedValue = parseAudToCents((fd.get("itemValue") as string) ?? "");
    onSave({
      businessName: fd.get("businessName") as string,
      suburb: (fd.get("suburb") as string) || null,
      contactName: (fd.get("contactName") as string) || null,
      contactEmail: (fd.get("contactEmail") as string) || null,
      contactPhone: (fd.get("contactPhone") as string) || null,
      notes: (fd.get("notes") as string) || null,
      item: (fd.get("item") as string) || null,
      itemValueCents:
        parsedValue === undefined ? prospect.itemValueCents : parsedValue,
      owner: (fd.get("owner") as string) || null,
      doNotContact: fd.get("doNotContact") === "on",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 py-4 bg-paper-deep space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClasses}>Business name</label>
          <input
            name="businessName"
            defaultValue={prospect.businessName}
            required
            className={editInput}
          />
        </div>
        <div>
          <label className={labelClasses}>Suburb</label>
          <input
            name="suburb"
            defaultValue={prospect.suburb ?? ""}
            className={editInput}
          />
        </div>
        <div>
          <label className={labelClasses}>Contact name</label>
          <input
            name="contactName"
            defaultValue={prospect.contactName ?? ""}
            className={editInput}
          />
        </div>
        <div>
          <label className={labelClasses}>Contact email</label>
          <input
            name="contactEmail"
            type="text"
            inputMode="email"
            defaultValue={prospect.contactEmail ?? ""}
            className={editInput}
          />
        </div>
        <div>
          <label className={labelClasses}>Contact phone</label>
          <input
            name="contactPhone"
            defaultValue={prospect.contactPhone ?? ""}
            className={editInput}
          />
        </div>
        <div>
          <label className={labelClasses}>Item donated</label>
          <input
            name="item"
            defaultValue={prospect.item ?? ""}
            placeholder="e.g. Two nights at Whale Beach"
            className={editInput}
          />
        </div>
        <div>
          <label className={labelClasses}>Item value (AUD)</label>
          <input
            name="itemValue"
            inputMode="decimal"
            defaultValue={centsToInput(prospect.itemValueCents)}
            placeholder="e.g. 1200"
            className={`${editInput} tabular-nums`}
          />
        </div>
        <div>
          <label className={labelClasses}>Owner</label>
          <select
            name="owner"
            defaultValue={prospect.owner ?? ""}
            className={editInput}
          >
            <option value="">Unassigned</option>
            {adminUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClasses}>Notes</label>
        <textarea
          name="notes"
          defaultValue={prospect.notes ?? ""}
          rows={2}
          className={`${editInput} resize-none`}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="doNotContact"
          defaultChecked={prospect.doNotContact}
          className="accent-rust"
        />
        <span className="font-mono text-xs uppercase tracking-wider text-moss">
          Do not contact
        </span>
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="font-mono text-xs uppercase tracking-[0.2em] bg-forest-deep text-bone px-4 py-2 hover:bg-rust transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="font-mono text-xs uppercase tracking-[0.2em] text-moss hover:text-ink transition-colors px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
