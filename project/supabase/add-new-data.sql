-- Seed data for Legal Billing
-- 10 fake law firms with bills due in the next 60 days (15th or last day of month)

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

-- Seed data for Contracts
-- 10 fake contracts with upcoming expirations

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
