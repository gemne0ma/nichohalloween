"use client";

import { useState, useTransition } from "react";
import { createTask, updateTaskStatus, updateTask, deleteTask } from "./actions";

type TaskStatus = "todo" | "in_progress" | "blocked" | "done";

type TaskTag = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
};

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  assignedTo: string | null;
  assigneeName: string | null;
  dueDate: string | null;
  status: TaskStatus;
  notes: string | null;
  tags: TaskTag[];
};

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
];

const statusClasses: Record<TaskStatus, string> = {
  todo: "bg-paper-deep text-ink-soft",
  in_progress: "bg-pumpkin/20 text-rust-deep",
  blocked: "bg-rust/20 text-rust-deep",
  done: "bg-forest/20 text-forest",
};

export default function TaskBoard({
  bucket,
  bucketLabel,
  tasks: initialTasks,
  adminUsers,
  allTags,
}: {
  bucket: string;
  bucketLabel: string;
  tasks: Task[];
  adminUsers: AdminUser[];
  allTags: TaskTag[];
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [filterTag, setFilterTag] = useState<string>("all");

  function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    startTransition(async () => {
      await updateTaskStatus(taskId, newStatus);
    });
  }

  function handleDelete(taskId: string) {
    if (!confirm("Delete this task? This can't be undone.")) return;
    startTransition(async () => {
      await deleteTask(taskId);
    });
  }

  async function handleCreate(formData: FormData) {
    formData.set("bucket", bucket);
    startTransition(async () => {
      await createTask(formData);
      setShowCreate(false);
    });
  }

  async function handleUpdate(taskId: string, formData: FormData) {
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || null;
    const dueDate = (formData.get("dueDate") as string) || null;
    const notes = (formData.get("notes") as string) || null;
    const assignedTo = (formData.get("assignedTo") as string) || null;
    const tagIds = formData.getAll("tagIds") as string[];

    startTransition(async () => {
      await updateTask(taskId, { title, description, dueDate, notes, assignedTo }, tagIds);
      setEditingId(null);
    });
  }

  // Apply filters
  let filtered = initialTasks;
  if (filterAssignee !== "all") {
    filtered = filtered.filter((t) =>
      filterAssignee === "unassigned" ? !t.assignedTo : t.assignedTo === filterAssignee
    );
  }
  if (filterTag !== "all") {
    filtered = filtered.filter((t) => t.tags.some((tag) => tag.id === filterTag));
  }

  const openTasks = filtered.filter((t) => t.status !== "done");
  const doneTasks = filtered.filter((t) => t.status === "done");

  const hasFilters = filterAssignee !== "all" || filterTag !== "all";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-rust-deep mb-1">
            Workstream
          </p>
          <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-ink">
            {bucketLabel}
          </h1>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] bg-forest-deep text-bone px-3 md:px-5 py-2 md:py-2.5 hover:bg-rust transition-colors"
        >
          {showCreate ? "Cancel" : "+ Add task"}
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <label className="font-mono text-[10px] uppercase tracking-wider text-moss">
            Assignee
          </label>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
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

        <div className="flex items-center gap-2">
          <label className="font-mono text-[10px] uppercase tracking-wider text-moss">
            Tag
          </label>
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="bg-bone border border-mist px-2 py-1.5 font-mono text-xs text-ink focus:outline-none focus:border-forest"
          >
            <option value="all">All</option>
            {allTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={() => { setFilterAssignee("all"); setFilterTag("all"); }}
            className="font-mono text-[10px] uppercase tracking-wider text-rust hover:text-rust-deep transition-colors py-1"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <form
          action={handleCreate}
          className="bg-bone border border-ink p-5 mb-6 space-y-4"
        >
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">
              Title
            </label>
            <input
              name="title"
              required
              className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest"
              placeholder="What needs doing?"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={2}
                className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest resize-none"
                placeholder="Optional details"
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">
                  Due date
                </label>
                <input
                  name="dueDate"
                  type="date"
                  className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest"
                />
              </div>
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-1">
                  Assign to
                </label>
                <select
                  name="assignedTo"
                  className="w-full bg-paper border border-mist px-3 py-2 font-mono text-sm text-ink focus:outline-none focus:border-forest"
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
          </div>

          {/* Tag checkboxes */}
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-moss block mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <label
                  key={tag.id}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="tagIds"
                    value={tag.id}
                    className="accent-forest"
                  />
                  <TagPill tag={tag} />
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="font-mono text-xs uppercase tracking-[0.3em] bg-forest-deep text-bone px-5 py-2.5 hover:bg-rust transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save task"}
          </button>
        </form>
      )}

      {/* Open tasks */}
      <div className="bg-bone border border-ink mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-mist">
          <h2 className="font-display text-xl text-ink">
            Open ({openTasks.length})
          </h2>
        </div>

        {openTasks.length === 0 ? (
          <div className="px-5 py-6">
            <p className="font-body text-base italic text-moss">
              {hasFilters
                ? "No tasks match these filters."
                : "No open tasks. Nice work, or time to add some."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dotted divide-mist">
            {openTasks.map((task) =>
              editingId === task.id ? (
                <EditRow
                  key={task.id}
                  task={task}
                  isPending={isPending}
                  adminUsers={adminUsers}
                  allTags={allTags}
                  onSave={(formData) => handleUpdate(task.id, formData)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <TaskRow
                  key={task.id}
                  task={task}
                  isPending={isPending}
                  onStatusChange={handleStatusChange}
                  onEdit={() => setEditingId(task.id)}
                  onDelete={() => handleDelete(task.id)}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Done tasks (collapsed by default) */}
      {doneTasks.length > 0 && (
        <details className="bg-bone border border-ink">
          <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <h2 className="font-display text-xl text-moss">
              Done ({doneTasks.length})
            </h2>
            <span className="font-mono text-xs text-moss">Click to show</span>
          </summary>
          <div className="divide-y divide-dotted divide-mist border-t border-mist">
            {doneTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                isPending={isPending}
                onStatusChange={handleStatusChange}
                onEdit={() => setEditingId(task.id)}
                onDelete={() => handleDelete(task.id)}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

// ─── Tag pill ───────────────────────────────────────────

function TagPill({ tag }: { tag: TaskTag }) {
  return (
    <span
      className="inline-block font-mono text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
      style={{
        backgroundColor: tag.color ? `${tag.color}20` : "#A8AC9F20",
        color: tag.color || "#5A6B4F",
      }}
    >
      {tag.name}
    </span>
  );
}

// ─── Task row ────────────────────────────────────────────

function TaskRow({
  task,
  isPending,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  task: Task;
  isPending: boolean;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isDone = task.status === "done";

  return (
    <div className="px-5 py-3">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() =>
            onStatusChange(task.id, isDone ? "todo" : "done")
          }
          disabled={isPending}
          aria-label={isDone ? `Mark "${task.title}" as to do` : `Mark "${task.title}" as done`}
          className={`mt-0.5 w-7 h-7 border rounded-sm flex-shrink-0 flex items-center justify-center transition-colors ${
            isDone
              ? "bg-forest border-forest text-bone"
              : "border-mist hover:border-forest"
          }`}
        >
          {isDone && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2.5 6L5 8.5L9.5 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`font-body text-base ${
              isDone ? "text-moss line-through" : "text-ink"
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="font-body text-sm text-moss mt-0.5">
              {task.description}
            </p>
          )}
          {/* Tags + assignee row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {task.tags.map((tag) => (
              <TagPill key={tag.id} tag={tag} />
            ))}
            {task.assigneeName && (
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-moss">
                {task.tags.length > 0 && "·"} {task.assigneeName}
              </span>
            )}
          </div>
        </div>

        {/* Due date */}
        {task.dueDate && (
          <span className="font-mono text-xs text-moss flex-shrink-0 mt-1">
            {new Date(task.dueDate).toLocaleDateString("en-AU", {
              day: "numeric",
              month: "short",
            })}
          </span>
        )}

        {/* Status pill */}
        <select
          value={task.status}
          onChange={(e) =>
            onStatusChange(task.id, e.target.value as TaskStatus)
          }
          disabled={isPending}
          aria-label={`Status for "${task.title}"`}
          className={`font-mono text-xs px-3 py-2 rounded border-none appearance-none cursor-pointer flex-shrink-0 ${
            statusClasses[task.status]
          }`}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Actions */}
        <button
          onClick={onEdit}
          className="font-mono text-xs text-moss hover:text-ink transition-colors flex-shrink-0 py-2 px-2"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          disabled={isPending}
          aria-label={`Delete "${task.title}"`}
          className="font-mono text-xs text-mist hover:text-rust transition-colors flex-shrink-0 py-2 px-2"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ─── Inline edit row ─────────────────────────────────────

function EditRow({
  task,
  isPending,
  adminUsers,
  allTags,
  onSave,
  onCancel,
}: {
  task: Task;
  isPending: boolean;
  adminUsers: AdminUser[];
  allTags: TaskTag[];
  onSave: (formData: FormData) => void;
  onCancel: () => void;
}) {
  const currentTagIds = task.tags.map((t) => t.id);

  return (
    <form action={onSave} className="px-5 py-4 bg-paper-deep space-y-3">
      <input
        name="title"
        defaultValue={task.title}
        required
        className="w-full bg-paper border border-mist px-3 py-2 font-body text-base text-ink focus:outline-none focus:border-forest"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <textarea
          name="description"
          defaultValue={task.description ?? ""}
          rows={2}
          placeholder="Description"
          className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest resize-none"
        />
        <div className="space-y-3">
          <input
            name="dueDate"
            type="date"
            defaultValue={task.dueDate ?? ""}
            className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest"
          />
          <select
            name="assignedTo"
            defaultValue={task.assignedTo ?? ""}
            className="w-full bg-paper border border-mist px-3 py-2 font-mono text-sm text-ink focus:outline-none focus:border-forest"
          >
            <option value="">Unassigned</option>
            {adminUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.email}
              </option>
            ))}
          </select>
          <textarea
            name="notes"
            defaultValue={task.notes ?? ""}
            rows={2}
            placeholder="Notes"
            className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest resize-none"
          />
        </div>
      </div>

      {/* Tag checkboxes */}
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <label
            key={tag.id}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <input
              type="checkbox"
              name="tagIds"
              value={tag.id}
              defaultChecked={currentTagIds.includes(tag.id)}
              className="accent-forest"
            />
            <TagPill tag={tag} />
          </label>
        ))}
      </div>

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
