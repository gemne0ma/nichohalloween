"use client";

import { useState, useTransition } from "react";
import { createTask, updateTaskStatus, updateTask, deleteTask } from "./actions";

type TaskStatus = "todo" | "in_progress" | "blocked" | "done";

type Task = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: TaskStatus;
  notes: string | null;
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
}: {
  bucket: string;
  bucketLabel: string;
  tasks: Task[];
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

    startTransition(async () => {
      await updateTask(taskId, { title, description, dueDate, notes });
      setEditingId(null);
    });
  }

  const openTasks = initialTasks.filter((t) => t.status !== "done");
  const doneTasks = initialTasks.filter((t) => t.status === "done");

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
              No open tasks. Nice work, or time to add some.
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
  onSave,
  onCancel,
}: {
  task: Task;
  isPending: boolean;
  onSave: (formData: FormData) => void;
  onCancel: () => void;
}) {
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
          <textarea
            name="notes"
            defaultValue={task.notes ?? ""}
            rows={2}
            placeholder="Notes"
            className="w-full bg-paper border border-mist px-3 py-2 font-body text-sm text-ink focus:outline-none focus:border-forest resize-none"
          />
        </div>
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
