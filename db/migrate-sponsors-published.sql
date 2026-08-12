-- Migration: add sponsors.published
-- Controls whether a sponsor appears on the public /sponsors page.
-- Defaults to false, so adding this column publishes nothing. Every
-- existing row stays hidden until somebody ticks the box in the admin.
-- Safe to run multiple times.

ALTER TABLE sponsors
  ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT false;

-- The public page filters on this and nothing else, so it is worth an index
-- even at ten rows. Partial: only published rows are ever queried.
CREATE INDEX IF NOT EXISTS idx_sponsors_published
  ON sponsors (tier)
  WHERE published;
