"use client";

import { useEffect, useState, useTransition } from "react";
import { setItemsReceived, setClassroomNotes, type ClassroomRow } from "./actions";

const MIN_VALUE_PER_ITEM = 100; // dollars, the committee's floor per lot

export default function ClassroomTracker({
  classrooms,
}: {
  classrooms: ClassroomRow[];
}) {
  const [isPending, startTransition] = useTransition();

  const totalTarget = classrooms.reduce((n, c) => n + c.targetItems, 0);
  const totalIn = classrooms.reduce((n, c) => n + c.itemsReceived, 0);
  const shortBy = Math.max(0, totalTarget - totalIn);
  const classroomsDone = classrooms.filter(
    (c) => c.itemsReceived >= c.targetItems
  ).length;

  return (
    <div>
      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">
            Lots in
          </p>
          <p className="font-display text-2xl text-ink tabular-nums">
            {totalIn} of {totalTarget}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">
            Still owed
          </p>
          <p
            className={`font-display text-2xl tabular-nums ${
              shortBy === 0 ? "text-forest" : "text-rust"
            }`}
          >
            {shortBy}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">
            Classrooms done
          </p>
          <p className="font-display text-2xl text-forest tabular-nums">
            {classroomsDone} of {classrooms.length}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-moss">
            Est. floor value
          </p>
          <p className="font-display text-2xl text-ink tabular-nums">
            ${(totalIn * MIN_VALUE_PER_ITEM).toLocaleString("en-AU")}
          </p>
          <p className="font-mono text-[9px] uppercase tracking-wider text-mist mt-0.5">
            At the ${MIN_VALUE_PER_ITEM} minimum
          </p>
        </div>
      </div>

      <div className="bg-bone border border-ink">
        <div className="px-5 py-4 border-b border-ink">
          <h2 className="font-display text-xl text-ink">Classrooms</h2>
        </div>

        <div>
          {classrooms.map((c, i) => (
            <ClassroomRowView
              key={c.id}
              classroom={c}
              isFirst={i === 0}
              isPending={isPending}
              onCountChange={(n) =>
                startTransition(async () => {
                  await setItemsReceived(c.id, n);
                })
              }
              onNotesChange={(notes) =>
                startTransition(async () => {
                  await setClassroomNotes(c.id, notes);
                })
              }
            />
          ))}
        </div>
      </div>

      <p className="font-body text-sm italic text-moss mt-4">
        Each classroom is responsible for {classrooms[0]?.targetItems ?? 10} lots
        at a minimum of ${MIN_VALUE_PER_ITEM} each. The lots themselves go
        straight to Air Auctioneer, so only the count is tracked here.
      </p>
    </div>
  );
}

function ClassroomRowView({
  classroom,
  isFirst,
  isPending,
  onCountChange,
  onNotesChange,
}: {
  classroom: ClassroomRow;
  isFirst: boolean;
  isPending: boolean;
  onCountChange: (n: number) => void;
  onNotesChange: (notes: string | null) => void;
}) {
  const [count, setCount] = useState(String(classroom.itemsReceived));
  const [notes, setNotes] = useState(classroom.notes ?? "");

  useEffect(() => setCount(String(classroom.itemsReceived)), [classroom.itemsReceived]);

  const received = classroom.itemsReceived;
  const target = classroom.targetItems;
  const done = received >= target;
  const pct = Math.min(100, target === 0 ? 0 : (received / target) * 100);

  function commitCount() {
    const n = Number(count.replace(/[^\d]/g, ""));
    if (!Number.isFinite(n)) {
      setCount(String(received));
      return;
    }
    if (n !== received) onCountChange(n);
  }

  return (
    <div
      className={`px-5 py-4 ${
        isFirst ? "" : "border-t border-dotted border-mist"
      }`}
    >
      <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
        <p className="font-display text-2xl text-ink w-16 flex-shrink-0">
          {classroom.name}
        </p>

        {/* Progress bar. Rust until the quota is met, forest once it is. */}
        <div className="flex-1 min-w-[140px]">
          <div className="h-2 bg-paper-deep border border-mist overflow-hidden">
            <div
              className={`h-full transition-all ${done ? "bg-forest" : "bg-rust"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <input
            type="text"
            inputMode="numeric"
            value={count}
            disabled={isPending}
            onChange={(e) => setCount(e.target.value)}
            onBlur={commitCount}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            aria-label={`Lots received for ${classroom.name}`}
            className="w-14 bg-paper border border-mist px-2 py-1 font-mono text-sm text-ink tabular-nums text-right focus:outline-none focus:border-forest disabled:opacity-50"
          />
          <span className="font-mono text-xs text-moss tabular-nums">
            of {target}
          </span>
          {done && (
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] px-2 py-1 bg-forest/20 text-forest">
              Done
            </span>
          )}
        </div>
      </div>

      <input
        type="text"
        value={notes}
        disabled={isPending}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => {
          if ((notes || null) !== (classroom.notes || null)) {
            onNotesChange(notes || null);
          }
        }}
        placeholder="Notes, e.g. who is chasing this classroom"
        className="w-full mt-2 bg-transparent border border-transparent hover:border-mist focus:border-forest focus:bg-paper px-2 py-1 font-body text-sm text-ink-soft placeholder:text-mist focus:outline-none disabled:opacity-50"
      />
    </div>
  );
}
