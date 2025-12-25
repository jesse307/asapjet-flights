-- Migration to add trip_type and return_date_time to leads table
-- Run this SQL in your Supabase project's SQL Editor

ALTER TABLE leads ADD COLUMN IF NOT EXISTS trip_type TEXT NOT NULL DEFAULT 'one-way';

ALTER TABLE leads ADD COLUMN IF NOT EXISTS return_date_time TEXT;