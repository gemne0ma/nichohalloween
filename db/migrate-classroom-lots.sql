-- Migration: classroom lot quota tracking
--
-- Each classroom is responsible for 10 lots, minimum $100 each. The lots
-- themselves are sourced by parents and uploaded straight to Air Auctioneer,
-- so they are deliberately NOT tracked here. This table answers one
-- question, in October, when it matters: has each classroom delivered?
--
-- Four rows, seeded below. Safe to run multiple times.

CREATE TABLE IF NOT EXISTS classroom_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  target_items INTEGER NOT NULL DEFAULT 10,
  items_received INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The 2026 classrooms. ON CONFLICT so re-running never resets a count.
INSERT INTO classroom_lots (name, sort_order) VALUES
  ('K-1',  1),
  ('Y2',   2),
  ('3-4',  3),
  ('5-6',  4)
ON CONFLICT (name) DO NOTHING;
