-- Migration: add item and item_value_cents to auction_prospects
-- What a business has actually donated, and what it is worth.
-- Value is stored in integer cents, never a float. Same rule as every other
-- money column in this schema.
-- Safe to run multiple times.

ALTER TABLE auction_prospects
  ADD COLUMN IF NOT EXISTS item TEXT;

ALTER TABLE auction_prospects
  ADD COLUMN IF NOT EXISTS item_value_cents INTEGER;
