"use client";

import { useEffect, useState } from "react";

// 24 Oct 2026, 3pm Sydney time (AEDT is UTC+11)
const FESTIVAL_DATE = new Date("2026-10-24T15:00:00+11:00");

function getTimeRemaining() {
  const now = new Date();
  const diff = FESTIVAL_DATE.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isPast: false };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-6xl md:text-7xl text-paper leading-none">
        {value.toString().padStart(2, "0")}
      </span>
      <span className="font-display font-bold text-lg tracking-[0.3em] uppercase text-pumpkin mt-2 [text-shadow:_0_2px_20px_rgba(0,0,0,0.8)]">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return <span className="text-3xl text-bone self-center">·</span>;
}

export default function Countdown() {
  const [time, setTime] = useState(getTimeRemaining());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(getTimeRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  if (time.isPast) {
    return (
      <p className="font-display text-3xl text-pumpkin italic">
        The festival has begun.
      </p>
    );
  }

  return (
    <div className="flex gap-6 justify-center items-baseline font-mono text-ink">
      <Unit value={time.days} label="days" />
      <Separator />
      <Unit value={time.hours} label="hours" />
      <Separator />
      <Unit value={time.minutes} label="mins" />
      <Separator />
      <Unit value={time.seconds} label="secs" />
    </div>
  );
}
