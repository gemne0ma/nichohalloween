-- Migration: add media table and media_category enum
-- Run this against Neon if drizzle-kit push doesn't work from the sandbox.
-- Safe to run multiple times (uses IF NOT EXISTS / DO blocks).

-- 1. Create the enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_category') THEN
    CREATE TYPE media_category AS ENUM ('gallery', 'sponsor', 'auction', 'vendor', 'other');
  END IF;
END
$$;

-- 2. Create the media table
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by TEXT REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  festival_year INTEGER NOT NULL,
  category media_category NOT NULL,
  caption TEXT,
  alt_text TEXT
);

-- 3. Index for common queries (filter by year + category)
CREATE INDEX IF NOT EXISTS idx_media_year_category ON media (festival_year, category);
