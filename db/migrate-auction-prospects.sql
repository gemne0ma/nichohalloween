-- Migration: add auction_prospects table and prospect_status enum
-- Business outreach tracker for the silent auction. Private data, admin only.
-- Safe to run multiple times (uses IF NOT EXISTS / DO blocks).

-- 1. Create the enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prospect_status') THEN
    CREATE TYPE prospect_status AS ENUM (
      'not_contacted',
      'contacted',
      'waiting_on_reply',
      'agreed_to_donate',
      'item_received',
      'declined'
    );
  END IF;
END
$$;

-- 2. Create the table.
-- business_name is the only NOT NULL field a user has to supply. Everything
-- else is optional so a business can be added from a name alone.
CREATE TABLE IF NOT EXISTS auction_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  status prospect_status NOT NULL DEFAULT 'not_contacted',
  suburb TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  notes TEXT,
  owner TEXT REFERENCES users(id),
  do_not_contact BOOLEAN NOT NULL DEFAULT false,
  last_contacted_at TIMESTAMPTZ,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Indexes for the two list filters (status, owner)
CREATE INDEX IF NOT EXISTS idx_auction_prospects_status ON auction_prospects (status);
CREATE INDEX IF NOT EXISTS idx_auction_prospects_owner ON auction_prospects (owner);

-- 4. Case-insensitive index on the name, used by the duplicate check on add.
CREATE INDEX IF NOT EXISTS idx_auction_prospects_name_lower ON auction_prospects (lower(business_name));
