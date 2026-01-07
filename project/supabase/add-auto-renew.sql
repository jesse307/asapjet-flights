-- Add auto_renew column to contracts table
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT false;

-- Update existing contracts with randomized auto-renewal values
UPDATE contracts SET auto_renew = (random() > 0.5);
