-- Migration: append-only activity log for auction prospects
--
-- auction_prospects holds current state: one status, one last_contacted_at,
-- one notes field. Every contact overwrites the last, so within a year you
-- cannot see who chased whom, and next year the record gets reused and 2026
-- disappears. This is the table CLAUDE.md's multi-event carve-out was
-- written for: the outreach history has to outlive the festival.
--
-- Append only. Nothing here is ever updated or deleted. A mistake gets a
-- correcting entry, not a rewrite, which is what makes it trustworthy as a
-- record years later.
--
-- Safe to run multiple times.

CREATE TABLE IF NOT EXISTS prospect_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES auction_prospects(id) ON DELETE CASCADE,
  -- manual: somebody typed it. status_change and created: written by the
  -- server, so the reliable spine of the history exists even when nobody
  -- remembers to write a note.
  kind TEXT NOT NULL DEFAULT 'manual',
  body TEXT NOT NULL,
  actor_id TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The only read pattern: every entry for one business, newest first.
CREATE INDEX IF NOT EXISTS idx_prospect_activity_prospect
  ON prospect_activity (prospect_id, created_at DESC);

-- Give existing businesses a starting point. Only the fact we can prove:
-- when the row was created and by whom. No invented contact history.
INSERT INTO prospect_activity (prospect_id, kind, body, actor_id, created_at)
SELECT p.id, 'created', 'Added to the outreach list', p.created_by, p.created_at
FROM auction_prospects p
WHERE NOT EXISTS (
  SELECT 1 FROM prospect_activity a WHERE a.prospect_id = p.id
);
