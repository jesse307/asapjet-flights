-- Migration to add trip_type and return_date_time to leads table
-- Run this SQL in your Supabase project's SQL Editor

-- Add trip_type column with constraint
ALTER TABLE leads ADD COLUMN IF NOT EXISTS trip_type TEXT NOT NULL DEFAULT 'one-way';

-- Add trip_type constraint (drop first if exists to avoid errors)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trip_type_check') THEN
    ALTER TABLE leads ADD CONSTRAINT trip_type_check CHECK (trip_type IN ('one-way', 'round-trip'));
  END IF;
END $$;

-- Add return_date_time as TIMESTAMPTZ for proper timezone handling
ALTER TABLE leads ADD COLUMN IF NOT EXISTS return_date_time TIMESTAMPTZ;

-- Add validation constraint: return_date_time must be after date_time for round-trip
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'return_after_departure_check') THEN
    ALTER TABLE leads ADD CONSTRAINT return_after_departure_check
      CHECK (trip_type = 'one-way' OR return_date_time IS NULL OR return_date_time > date_time::TIMESTAMPTZ);
  END IF;
END $$;