import { Module } from '@/types';

export const modules: Module[] = [
  {
    id: 'entity-management',
    title: 'Entity Management',
    description: 'Manage corporate entities, governance structure, and organizational hierarchies',
    icon: 'building-2',
    color: 'blue',
    href: '/modules/entity-management',
    allowedRoles: ['admin', 'manager', 'user'],
  },
  {
    id: 'legal-billing',
    title: 'Legal Billing',
    description: 'Track legal expenses, manage vendor invoices, and monitor department budgets',
    icon: 'receipt',
    color: 'emerald',
    href: '/modules/legal-billing',
    allowedRoles: ['admin', 'manager', 'user'],
  },
  {
    id: 'contracts',
    title: 'Contracts',
    description: 'Create, review, and manage legal contracts and agreements',
    icon: 'file-text',
    color: 'violet',
    href: '/modules/contracts',
    allowedRoles: ['admin', 'manager', 'user', 'viewer'],
  },
];
