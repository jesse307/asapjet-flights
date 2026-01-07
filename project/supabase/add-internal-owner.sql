-- Add internal_owner column to entities table
ALTER TABLE entities ADD COLUMN IF NOT EXISTS internal_owner VARCHAR(100);

-- Update existing entities with randomized internal owners
UPDATE entities SET internal_owner = 'Linda Cardwell' WHERE company_name IN (
  'Apex Ventures LLC',
  'BlueSky Technologies Corp',
  'Phoenix Investments Group',
  'Horizon Global Solutions',
  'Catalyst Enterprises Inc'
);

UPDATE entities SET internal_owner = 'Juanita Luna' WHERE company_name IN (
  'Silverstone Holdings Inc',
  'Meridian Capital Partners',
  'Quantum Industries LLC',
  'Pinnacle Equity Corp',
  'Summit Strategic Holdings'
);
