-- Migration to add call_logs table for VAPI phone call tracking
-- Run this SQL in your Supabase project's SQL Editor

-- Create call_logs table for VAPI phone call tracking
CREATE TABLE IF NOT EXISTS call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id TEXT UNIQUE NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration INTEGER,
  cost NUMERIC(10, 4),
  error TEXT,
  transcript TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on call_id for fast lookups from webhooks
CREATE INDEX IF NOT EXISTS idx_call_logs_call_id ON call_logs(call_id);

-- Create index on lead_id to quickly find all calls for a lead
CREATE INDEX IF NOT EXISTS idx_call_logs_lead_id ON call_logs(lead_id);

-- Create index on timestamp for sorting
CREATE INDEX IF NOT EXISTS idx_call_logs_timestamp ON call_logs(timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth needs)
-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Enable all access for service role" ON call_logs;

CREATE POLICY "Enable all access for service role" ON call_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);
