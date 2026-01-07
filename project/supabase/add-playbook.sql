-- Create contract_playbook table for storing redline guidance
CREATE TABLE IF NOT EXISTS contract_playbook (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clause_category VARCHAR(100) NOT NULL,
  clause_name VARCHAR(255) NOT NULL,
  position VARCHAR(20) NOT NULL CHECK (position IN ('accept', 'reject', 'negotiate')),
  guidance TEXT NOT NULL,
  example_language TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_playbook_category ON contract_playbook(clause_category);
CREATE INDEX IF NOT EXISTS idx_playbook_position ON contract_playbook(position);

-- Enable Row Level Security
ALTER TABLE contract_playbook ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (read-only for all users)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contract_playbook' AND policyname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users" ON contract_playbook FOR SELECT USING (true);
  END IF;
END $$;

-- Seed data for contract playbook
-- Typical redlines that companies accept, reject, or negotiate

INSERT INTO contract_playbook (clause_category, clause_name, position, guidance, example_language) VALUES
  -- ACCEPT positions
  ('Indemnification', 'Mutual Indemnification', 'accept', 'Generally acceptable when both parties have equal indemnification obligations for their respective breaches.', 'Each party shall indemnify, defend, and hold harmless the other party from claims arising from such party''s breach of this Agreement or negligent acts.'),

  ('Limitation of Liability', 'Cap at 12-Month Fees', 'accept', 'Standard cap at 12 months of fees paid is generally acceptable for SaaS and service agreements.', 'Neither party''s total liability shall exceed the amounts paid or payable in the twelve (12) months preceding the claim.'),

  ('Confidentiality', 'Standard Confidentiality Terms', 'accept', 'Standard mutual confidentiality provisions with 3-5 year terms are acceptable.', 'Each party agrees to maintain confidentiality of the other party''s Confidential Information for a period of three (3) years from disclosure.'),

  ('Payment Terms', 'Net 30 Payment Terms', 'accept', 'Net 30 payment terms are standard and acceptable for most commercial agreements.', 'All invoices shall be paid within thirty (30) days of receipt.'),

  ('Data Privacy', 'GDPR/CCPA Compliance', 'accept', 'Data privacy compliance provisions aligned with GDPR and CCPA are acceptable and often required.', 'Service Provider shall comply with all applicable data protection laws, including GDPR and CCPA.'),

  -- REJECT positions
  ('Indemnification', 'Unlimited Indemnification', 'reject', 'REJECT: Unlimited or uncapped indemnification obligations expose the company to excessive risk.', 'Provider shall indemnify Customer for all claims, damages, and losses of any kind without limitation.'),

  ('Limitation of Liability', 'No Liability Cap', 'reject', 'REJECT: Provisions removing or eliminating liability caps are unacceptable.', 'The limitations of liability set forth in this Agreement shall not apply to [broad category].'),

  ('Governing Law', 'Foreign Jurisdiction', 'reject', 'REJECT: Governing law outside the U.S. or our primary jurisdictions creates enforcement challenges.', 'This Agreement shall be governed by the laws of [foreign country].'),

  ('Intellectual Property', 'Broad IP Assignment', 'reject', 'REJECT: Provisions requiring assignment of pre-existing or independently developed IP are unacceptable.', 'All intellectual property created during the term, whether related to this Agreement or not, shall belong to Customer.'),

  ('Termination', 'No Termination for Convenience', 'reject', 'REJECT: Lack of termination for convenience rights, especially in multi-year deals, is unacceptable.', 'This Agreement may only be terminated for material breach or bankruptcy.'),

  ('Auto-Renewal', 'Auto-Renewal Without Notice', 'reject', 'REJECT: Automatic renewal without advance notice requirements (min 60-90 days) is unacceptable.', 'This Agreement shall automatically renew for successive one-year terms unless terminated.'),

  -- NEGOTIATE positions
  ('Warranties', 'Limited Warranties', 'negotiate', 'NEGOTIATE: Push for specific performance warranties rather than "as-is" disclaimers in service agreements.', 'Services shall be performed in a professional manner consistent with industry standards.'),

  ('Limitation of Liability', 'Consequential Damages Exclusion', 'negotiate', 'NEGOTIATE: Consider carve-outs for specific scenarios (breach of confidentiality, IP infringement, data breaches).', 'Neither party shall be liable for consequential, indirect, or special damages, except for [carve-outs].'),

  ('Indemnification', 'IP Indemnification', 'negotiate', 'NEGOTIATE: Ensure vendor provides IP indemnification with reasonable limitations and cooperation requirements.', 'Vendor shall indemnify Customer from third-party claims alleging that the Services infringe intellectual property rights.'),

  ('Term and Termination', 'Initial Term Length', 'negotiate', 'NEGOTIATE: Prefer 1-2 year initial terms with annual renewals over 3+ year commitments.', 'The initial term shall be [X] years, renewing automatically for successive one-year periods.'),

  ('Service Levels', 'SLA Credits', 'negotiate', 'NEGOTIATE: Push for meaningful SLA credits (10-25% monthly fees) rather than nominal amounts.', 'If service availability falls below 99.5%, Customer shall receive a credit of [X]% of monthly fees.'),

  ('Audit Rights', 'Audit Frequency', 'negotiate', 'NEGOTIATE: Limit audits to once annually unless fraud is suspected; ensure reasonable notice periods.', 'Customer may audit Vendor''s compliance [frequency] upon [notice period] prior written notice.');
