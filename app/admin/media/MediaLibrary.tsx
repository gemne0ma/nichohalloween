"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { MediaRow } from "@/app/admin/queries";
import ImageUpload from "@/app/admin/components/ImageUpload";
import { updateMedia, deleteMedia } from "./actions";

type Props = {
  items: MediaRow[];
  publicUrlPrefix: string;
};

const CATEGORIES = [
  { value: "", label: "All categories" },
  { value: "gallery", label: "Gallery" },
  { value: "sponsor", label: "Sponsor" },
  { value: "auction", label: "Auction" },
  { value: "vendor", label: "Vendor" },
  { value: "other", label: "Other" },
];

const YEARS = [
  { value: "", label: "All years" },
  { value: "2026", label: "2026" },
  { value: "2025", label: "2025" },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibrary({ items, publicUrlPrefix }: Props) {
  const router = useRouter();
  const [showUpload, setShowUpload] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editAltText, setEditAltText] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [filterCategory, setFilterCategory] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Client-side filtering (data already loaded by server)
  const filtered = items.filter((item) => {
    if (filterCategory && item.category !== filterCategory) return false;
    if (filterYear && item.festivalYear !== Number(filterYear)) return false;
    return true;
  });

  function startEdit(item: MediaRow) {
    setEditingId(item.id);
    setEditCaption(item.caption || "");
    setEditAltText(item.altText || "");
  }

  function handleSave() {
    if (!editingId) return;
    startTransition(async () => {
      await updateMedia(editingId, { caption: editCaption, altText: editAltText });
      setEditingId(null);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteMedia(id);
      setDeletingId(null);
      router.refresh();
    });
  }

  function getPublicUrl(r2Key: string) {
    const base = publicUrlPrefix.replace(/\/$/, "");
    return `${base}/${r2Key}`;
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Media</h1>
          <p className="font-body text-ink-soft mt-1">
            {items.length} file{items.length !== 1 ? "s" : ""} uploaded
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-4 py-2 bg-rust text-bone font-mono text-sm uppercase tracking-wider rounded hover:bg-rust-deep transition-colors"
        >
          {showUpload ? "Close" : "Upload"}
        </button>
      </div>

      {/* Upload form (toggle) */}
      {showUpload && (
        <div className="bg-bone rounded-lg p-6 border border-mist">
          <ImageUpload
            category="gallery"
            festivalYear={2026}
            label="Upload a new file"
            onUploadComplete={() => {
              setShowUpload(false);
              router.refresh();
            }}
          />
          <p className="text-xs font-mono text-moss mt-3">
            Default category: gallery. Edit the category after upload if needed.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-1.5 bg-bone border border-mist rounded font-body text-sm text-ink"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="px-3 py-1.5 bg-bone border border-mist rounded font-body text-sm text-ink"
        >
          {YEARS.map((y) => (
            <option key={y.value} value={y.value}>
              {y.label}
            </option>
          ))}
        </select>
        {(filterCategory || filterYear) && (
          <button
            onClick={() => {
              setFilterCategory("");
              setFilterYear("");
            }}
            className="px-3 py-1.5 text-sm font-mono text-rust hover:text-rust-deep transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Media grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-moss font-body">
          {items.length === 0
            ? "No files uploaded yet. Click Upload to get started."
            : "No files match your filters."}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-bone rounded-lg border border-mist overflow-hidden group"
            >
              {/* Thumbnail */}
              <div className="aspect-square relative bg-paper-deep">
                {item.fileType.startsWith("image/") ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={getPublicUrl(item.r2Key)}
                    alt={item.altText || item.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-mono text-xs uppercase text-moss">
                      {item.fileType.split("/")[1] || "file"}
                    </span>
                  </div>
                )}

                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={getPublicUrl(item.r2Key)}
                    download={item.filename}
                    className="px-3 py-1.5 bg-forest text-bone rounded text-xs font-mono uppercase"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => startEdit(item)}
                    className="px-3 py-1.5 bg-bone text-ink rounded text-xs font-mono uppercase"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingId(item.id)}
                    className="px-3 py-1.5 bg-rust text-bone rounded text-xs font-mono uppercase"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 space-y-1">
                <p
                  className="font-body text-sm text-ink truncate"
                  title={item.filename}
                >
                  {item.filename}
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-moss uppercase">
                    {item.category}
                  </span>
                  <span className="font-mono text-xs text-mist">
                    {formatBytes(item.fileSize)}
                  </span>
                </div>
                {item.caption && (
                  <p className="font-body text-xs text-ink-soft truncate">
                    {item.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40">
          <div className="bg-paper rounded-lg p-6 w-full max-w-md shadow-lg space-y-4">
            <h2 className="font-display text-xl text-ink">Edit details</h2>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-ink-soft mb-1">
                Caption
              </label>
              <input
                type="text"
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                className="w-full px-3 py-2 bg-bone border border-mist rounded font-body text-sm text-ink"
                placeholder="Optional caption"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-ink-soft mb-1">
                Alt text
              </label>
              <input
                type="text"
                value={editAltText}
                onChange={(e) => setEditAltText(e.target.value)}
                className="w-full px-3 py-2 bg-bone border border-mist rounded font-body text-sm text-ink"
                placeholder="Describe the image for accessibility"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setEditingId(null)}
                className="px-4 py-2 font-mono text-sm text-ink-soft hover:text-ink transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="px-4 py-2 bg-forest text-bone font-mono text-sm uppercase tracking-wider rounded hover:bg-forest-deep transition-colors disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40">
          <div className="bg-paper rounded-lg p-6 w-full max-w-sm shadow-lg space-y-4">
            <h2 className="font-display text-xl text-ink">Delete file?</h2>
            <p className="font-body text-ink-soft">
              This will permanently delete the file from storage. This can't be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 font-mono text-sm text-ink-soft hover:text-ink transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={isPending}
                className="px-4 py-2 bg-rust text-bone font-mono text-sm uppercase tracking-wider rounded hover:bg-rust-deep transition-colors disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
