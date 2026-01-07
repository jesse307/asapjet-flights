# Database Setup Guide

Follow these steps to set up your Supabase database for the Entity Management module.

## Step 1: Create the Table

Go to your Supabase SQL Editor:
https://supabase.com/dashboard/project/pozzeqqljpzpkhhtrxss/sql/new

Copy and paste this SQL and click "Run":

```sql
-- Entity Management Table
CREATE TABLE IF NOT EXISTS entities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  home_state VARCHAR(50) NOT NULL,
  states_qualified TEXT[] NOT NULL,
  next_compliance_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for demo purposes)
CREATE POLICY "Allow all operations on entities" ON entities
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_entities_company_name ON entities(company_name);
CREATE INDEX IF NOT EXISTS idx_entities_next_compliance_date ON entities(next_compliance_date);
```

## Step 2: Insert Demo Data

After the table is created, run this SQL to insert the 10 demo companies:

```sql
-- Seed data for Entity Management
INSERT INTO entities (company_name, home_state, states_qualified, next_compliance_date) VALUES
  ('Apex Ventures LLC', 'Delaware', ARRAY['California', 'New York', 'Texas', 'Florida', 'Nevada'], '2026-02-15'),
  ('Silverstone Holdings Inc', 'Texas', ARRAY['Delaware', 'Arizona', 'Colorado', 'Georgia', 'Illinois'], '2026-03-22'),
  ('BlueSky Technologies Corp', 'Delaware', ARRAY['Washington', 'Oregon', 'Massachusetts', 'Virginia', 'Maryland'], '2026-01-28'),
  ('Meridian Capital Partners', 'Delaware', ARRAY['New York', 'New Jersey', 'Connecticut', 'Pennsylvania', 'Ohio'], '2026-04-10'),
  ('Phoenix Investments Group', 'Texas', ARRAY['California', 'Nevada', 'Utah', 'New Mexico', 'Oklahoma'], '2026-02-05'),
  ('Quantum Industries LLC', 'Delaware', ARRAY['Michigan', 'Indiana', 'Wisconsin', 'Minnesota', 'Missouri'], '2026-05-18'),
  ('Horizon Global Solutions', 'Texas', ARRAY['North Carolina', 'South Carolina', 'Tennessee', 'Alabama', 'Louisiana'], '2026-03-07'),
  ('Pinnacle Equity Corp', 'Delaware', ARRAY['California', 'Texas', 'Florida', 'Illinois', 'Ohio'], '2026-06-14'),
  ('Catalyst Enterprises Inc', 'Delaware', ARRAY['Georgia', 'Virginia', 'Colorado', 'Arizona', 'Washington'], '2026-01-30'),
  ('Summit Strategic Holdings', 'Texas', ARRAY['New York', 'Massachusetts', 'Pennsylvania', 'New Jersey', 'Maryland'], '2026-04-25');
```

## Step 3: Verify the Data

Run this query to verify the data was inserted:

```sql
SELECT company_name, home_state, next_compliance_date
FROM entities
ORDER BY company_name;
```

You should see 10 companies listed!

## Step 4: Start Your Development Server

```bash
cd project
npm install
npm run dev
```

Then navigate to http://localhost:3000 and click on "Entity Management" to see your data!
