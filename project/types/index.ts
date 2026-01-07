export type UserLevel = 'admin' | 'manager' | 'user' | 'viewer';

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  href: string;
  allowedRoles: UserLevel[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserLevel;
  department: string;
}

export interface Entity {
  id: string;
  company_name: string;
  home_state: string;
  states_qualified: string[];
  next_compliance_date: string;
  internal_owner?: string;
  created_at: string;
  updated_at: string;
}

export interface LegalBill {
  id: string;
  law_firm_name: string;
  invoice_number: string;
  amount: number;
  due_date: string;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  contract_name: string;
  contract_type: string;
  counterparty: string;
  expiration_date: string;
  status: string;
  value: number | null;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContractPlaybook {
  id: string;
  clause_category: string;
  clause_name: string;
  position: 'accept' | 'reject' | 'negotiate';
  guidance: string;
  example_language: string | null;
  created_at: string;
  updated_at: string;
}
