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

-- Enable Row Level Security
ALTER TABLE legal_bills ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for demo purposes)
CREATE POLICY "Allow all operations on legal_bills" ON legal_bills
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
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

-- Enable Row Level Security
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for demo purposes)
CREATE POLICY "Allow all operations on contracts" ON contracts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contracts_contract_name ON contracts(contract_name);
CREATE INDEX IF NOT EXISTS idx_contracts_expiration_date ON contracts(expiration_date);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
