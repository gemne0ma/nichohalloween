"use client";

import { useEffect, useState } from "react";

const FESTIVAL_DATE = new Date("2026-10-24T15:00:00+11:00");

function getDaysRemaining(): number {
  const now = new Date();
  const diff = FESTIVAL_DATE.getTime() - now.getTime();
  if (diff <= 0) return 0;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function DashboardCountdown() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(getDaysRemaining());
    const interval = setInterval(() => setDays(getDaysRemaining()), 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  if (days === null) return null;

  if (days === 0) {
    return (
      <p className="font-display text-3xl text-rust italic">Festival day.</p>
    );
  }

  return (
    <div className="text-right">
      <p className="font-display text-5xl text-forest leading-none">{days}</p>
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-rust-deep mt-1">
        days to go
      </p>
    </div>
  );
}
