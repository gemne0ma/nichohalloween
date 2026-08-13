-- Migration: issue order numbers from a Postgres sequence
--
-- The webhook used to derive the next number with SELECT count(*) then add
-- one. Two Stripe deliveries arriving together read the same count and
-- produce the same NHF-XXXX, and nothing in the database stopped it. A
-- duplicate order number means two customers holding the same receipt at the
-- token booth.
--
-- The sequence makes the number atomic: nextval() is never handed to two
-- callers. The unique constraint is the backstop that makes a regression
-- loud instead of silent.
--
-- Safe to run multiple times.

-- 1. The sequence itself.
CREATE SEQUENCE IF NOT EXISTS token_order_number_seq;

-- 2. Park it above the highest order number already issued, so no existing
--    order is affected and no number is ever reused. GREATEST against the
--    current value means re-running this can only ever move it forward.
SELECT setval(
  'token_order_number_seq',
  GREATEST(
    (SELECT COALESCE(MAX(NULLIF(regexp_replace(order_number, '\D', '', 'g'), '')::int), 0)
       FROM token_orders),
    (SELECT last_value FROM token_order_number_seq)
  )
);

-- 3. Generate the number in the database, not in application code. Any
--    insert that omits order_number now gets the next one atomically.
--    lpad keeps the NHF-0001 shape and grows past 9999 rather than truncating.
ALTER TABLE token_orders
  ALTER COLUMN order_number
  SET DEFAULT 'NHF-' || lpad(nextval('token_order_number_seq')::text, 4, '0');

-- 4. Backstop. If anything ever tries to reuse a number the insert fails
--    rather than quietly writing a duplicate.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'token_orders_order_number_unique'
  ) THEN
    ALTER TABLE token_orders
      ADD CONSTRAINT token_orders_order_number_unique UNIQUE (order_number);
  END IF;
END
$$;
