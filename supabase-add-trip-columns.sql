-- Migration to add trip_type and return_date_time to leads table
-- Run this SQL in your Supabase project's SQL Editor

-- Add trip_type column with constraint
ALTER TABLE leads ADD COLUMN IF NOT EXISTS trip_type TEXT NOT NULL DEFAULT 'one-way';
ALTER TABLE leads ADD CONSTRAINT IF NOT EXISTS trip_type_check CHECK (trip_type IN ('one-way', 'round-trip'));

-- Add return_date_time as TIMESTAMPTZ for proper timezone handling
ALTER TABLE leads ADD COLUMN IF NOT EXISTS return_date_time TIMESTAMPTZ;

-- Add validation constraint: return_date_time must be after date_time for round-trip
ALTER TABLE leads ADD CONSTRAINT IF NOT EXISTS return_after_departure_check
  CHECK (trip_type = 'one-way' OR return_date_time IS NULL OR return_date_time > date_time::TIMESTAMPTZ);