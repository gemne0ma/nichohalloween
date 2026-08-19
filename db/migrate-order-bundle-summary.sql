-- Migration: allow one order to contain several bundles
--
-- token_orders assumed one bundle per order: bundle_type was a NOT NULL enum
-- with four values and no way to say "2 x 25 and 1 x 200". With a cart, a
-- family buying 250 tokens should get one order number and one line on the
-- printed list, not two of each.
--
-- The two fields that matter operationally already work as totals:
-- tokens_purchased is what the volunteer hands over, amount_paid is what the
-- treasurer reconciles. Only bundle_type had nowhere to go.
--
-- bundle_summary carries a human readable breakdown, e.g. "2 x 25, 1 x 200".
-- Nothing queries it: it exists for the CSV the booth prints and for the
-- admin list. Deliberately not a child table, per the note in CLAUDE.md about
-- resisting abstraction that will only ever run once.
--
-- Safe to run multiple times.

ALTER TABLE token_orders
  ADD COLUMN IF NOT EXISTS bundle_summary TEXT;

-- bundle_type stays for single-bundle orders, which will still be most of
-- them, but can no longer be required.
ALTER TABLE token_orders
  ALTER COLUMN bundle_type DROP NOT NULL;

-- Give the existing orders a summary so the CSV column is never blank.
-- BUNDLE_25 becomes "1 x 25".
UPDATE token_orders
SET bundle_summary = '1 x ' || replace(bundle_type::text, 'BUNDLE_', '')
WHERE bundle_summary IS NULL
  AND bundle_type IS NOT NULL;
