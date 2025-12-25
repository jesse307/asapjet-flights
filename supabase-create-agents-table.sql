-- Migration to create agents table for managing on-call agents
-- Run this SQL in your Supabase project's SQL Editor

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  on_call BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on on_call for faster lookups
CREATE INDEX IF NOT EXISTS idx_agents_on_call ON agents(on_call) WHERE on_call = true;

-- Create index on active status
CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(active) WHERE active = true;

-- Add constraint to ensure only one agent is on-call at a time
-- This will be enforced at the application level instead for flexibility

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;

-- Create trigger for updated_at
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
-- You should modify this based on your auth setup
CREATE POLICY "Enable all access for authenticated users" ON agents
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert a default agent (optional - you can remove this)
INSERT INTO agents (name, email, phone, on_call, active)
VALUES
  ('Default Agent', 'agent@asapjet.com', '+15551234567', true, true)
ON CONFLICT (email) DO NOTHING;
