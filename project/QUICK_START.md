# Quick Start - Database Setup

## Run These SQL Scripts in Supabase

Go to: https://supabase.com/dashboard/project/pozzeqqljpzpkhhtrxss/sql/new

### Step 1: Create All Tables

Copy and paste this SQL to create all three tables (entities, legal_bills, contracts):

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

ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on entities" ON entities FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_entities_company_name ON entities(company_name);
CREATE INDEX IF NOT EXISTS idx_entities_next_compliance_date ON entities(next_compliance_date);

-- Legal Billing Table
CREATE TABLE IF NOT EXISTS legal_bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  law_firm_name VARCHAR(255) NOT NULL,
  invoice_number VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE legal_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on legal_bills" ON legal_bills FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_legal_bills_law_firm_name ON legal_bills(law_firm_name);
CREATE INDEX IF NOT EXISTS idx_legal_bills_due_date ON legal_bills(due_date);
CREATE INDEX IF NOT EXISTS idx_legal_bills_status ON legal_bills(status);

-- Contracts Table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_name VARCHAR(255) NOT NULL,
  contract_type VARCHAR(100) NOT NULL,
  counterparty VARCHAR(255) NOT NULL,
  expiration_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  value DECIMAL(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on contracts" ON contracts FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_name ON contracts(contract_name);
CREATE INDEX IF NOT EXISTS idx_contracts_expiration_date ON contracts(expiration_date);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
```

### Step 2: Insert All Demo Data

After creating the tables, run this SQL to insert demo data for all three modules:

```sql
-- Seed data for Entity Management (10 companies)
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

-- Seed data for Legal Billing (10 law firms with bills due in next 60 days)
INSERT INTO legal_bills (law_firm_name, invoice_number, amount, due_date, status, description) VALUES
  ('Morrison & Fitzpatrick LLP', 'INV-2026-001', 45750.00, '2026-01-15', 'pending', 'Corporate governance advisory services - Q4 2025'),
  ('Sterling Legal Group', 'INV-2026-024', 28500.00, '2026-01-31', 'pending', 'Contract review and negotiation services'),
  ('Whitfield & Associates', 'INV-2026-047', 62300.00, '2026-02-15', 'pending', 'Merger and acquisition legal support'),
  ('Blackstone Law Partners', 'INV-2026-089', 18900.00, '2026-02-28', 'pending', 'Employment law consultation and compliance'),
  ('Chapman & Rhodes PC', 'INV-2026-112', 51200.00, '2026-03-15', 'pending', 'Intellectual property protection and filing'),
  ('Riverside Legal Advisors', 'INV-2026-156', 33400.00, '2026-01-31', 'pending', 'Real estate transaction legal services'),
  ('Preston & Hart Attorneys', 'INV-2026-203', 41800.00, '2026-02-15', 'pending', 'Regulatory compliance and risk assessment'),
  ('Donnelly Law Firm', 'INV-2026-267', 25600.00, '2026-02-28', 'pending', 'Litigation support and document preparation'),
  ('Harrington & Chen LLP', 'INV-2026-298', 38950.00, '2026-03-15', 'pending', 'Tax planning and corporate structuring'),
  ('Greenfield Legal Services', 'INV-2026-334', 29700.00, '2026-01-15', 'pending', 'General counsel retainer - January 2026');

-- Seed data for Contracts (10 contracts with upcoming expirations)
INSERT INTO contracts (contract_name, contract_type, counterparty, expiration_date, status, value) VALUES
  ('Master Services Agreement 2024', 'Service Agreement', 'TechVision Solutions Inc', '2026-03-31', 'active', 250000.00),
  ('Office Lease - Downtown Tower', 'Real Estate Lease', 'Metropolitan Properties LLC', '2026-04-30', 'active', 480000.00),
  ('Software Licensing Agreement', 'License Agreement', 'DataCore Systems', '2026-02-28', 'active', 125000.00),
  ('Cloud Infrastructure Contract', 'Service Agreement', 'CloudNet Services', '2026-05-15', 'active', 180000.00),
  ('Professional Services Agreement', 'Consulting Agreement', 'Strategic Advisors Group', '2026-03-15', 'active', 95000.00),
  ('Equipment Purchase Agreement', 'Purchase Agreement', 'Global Tech Supply Co', '2026-02-15', 'active', 340000.00),
  ('Marketing Services Contract', 'Service Agreement', 'Brand Elevation Agency', '2026-04-15', 'active', 72000.00),
  ('Non-Disclosure Agreement', 'Confidentiality Agreement', 'Innovation Partners Ltd', '2026-06-30', 'active', NULL),
  ('Managed IT Services Agreement', 'Service Agreement', 'SecureNet Technologies', '2026-05-31', 'active', 156000.00),
  ('Vendor Supply Agreement', 'Supply Agreement', 'Premier Office Solutions', '2026-03-31', 'active', 88500.00);
```

### Step 3: Verify the Data

Run these queries to verify your data was inserted:

```sql
-- Check entities
SELECT company_name, home_state, next_compliance_date FROM entities ORDER BY company_name;

-- Check legal bills
SELECT law_firm_name, amount, due_date FROM legal_bills ORDER BY due_date;

-- Check contracts
SELECT contract_name, counterparty, expiration_date FROM contracts ORDER BY expiration_date;
```

You should see:
- 10 companies in Entity Management
- 10 law firm invoices in Legal Billing
- 10 contracts in Contracts

## That's It!

Your Vercel deployment is live with all three modules ready to go:

- **Entity Management** - 10 companies with compliance tracking
- **Legal Billing** - 10 law firm invoices with amounts and due dates
- **Contracts** - 10 contracts with expiration tracking

Visit your Vercel URL and explore all three modules!
