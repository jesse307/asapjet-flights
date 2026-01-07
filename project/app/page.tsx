'use client';

import Header from '@/components/Header';
import LedesChat from '@/components/LedesChat';
import { modules } from '@/lib/modules';
import { User, Entity, LegalBill, Contract } from '@/types';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const mockUser: User = {
  id: '1',
  name: 'Ryan Manitoba',
  email: 'ryan.manitoba@company.com',
  role: 'manager',
  department: 'Legal',
};

export default function Home() {
  const [upcomingEntities, setUpcomingEntities] = useState<Entity[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<LegalBill[]>([]);
  const [upcomingContracts, setUpcomingContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  const userModules = modules.filter((module) =>
    module.allowedRoles.includes(mockUser.role)
  );

  useEffect(() => {
    async function fetchUpcomingItems() {
      try {
        const { data: entities } = await supabase
          .from('entities')
          .select('*')
          .order('next_compliance_date', { ascending: true })
          .limit(3);

        const { data: bills } = await supabase
          .from('legal_bills')
          .select('*')
          .eq('status', 'pending')
          .order('due_date', { ascending: true })
          .limit(3);

        const { data: contracts } = await supabase
          .from('contracts')
          .select('*')
          .eq('status', 'active')
          .order('expiration_date', { ascending: true })
          .limit(3);

        setUpcomingEntities(entities || []);
        setUpcomingBills(bills || []);
        setUpcomingContracts(contracts || []);
      } catch (error) {
        console.error('Error fetching upcoming items:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUpcomingItems();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const target = new Date(dateString);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getModuleData = (moduleId: string) => {
    switch (moduleId) {
      case 'entity-management':
        return upcomingEntities.map(e => ({
          primary: e.company_name,
          secondary: e.internal_owner || 'Unassigned',
          date: formatDate(e.next_compliance_date),
          days: getDaysUntil(e.next_compliance_date)
        }));
      case 'legal-billing':
        return upcomingBills.map(b => ({
          primary: b.law_firm_name,
          secondary: formatCurrency(b.amount),
          date: formatDate(b.due_date),
          days: getDaysUntil(b.due_date)
        }));
      case 'contracts':
        return upcomingContracts.map(c => ({
          primary: c.contract_name,
          secondary: c.counterparty,
          date: formatDate(c.expiration_date),
          days: getDaysUntil(c.expiration_date)
        }));
      default:
        return [];
    }
  };

  const iconMap: Record<string, string> = {
    'entity-management': '🏢',
    'legal-billing': '💰',
    'contracts': '📄'
  };

  const colorMap: Record<string, { bg: string; border: string; text: string; hover: string }> = {
    'entity-management': {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      hover: 'hover:bg-blue-100'
    },
    'legal-billing': {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      hover: 'hover:bg-emerald-100'
    },
    'contracts': {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      hover: 'hover:bg-purple-100'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={mockUser} />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Welcome back, {mockUser.name.split(' ')[0]} 👋
            </h1>
            <p className="text-xl text-gray-600">
              Your legal operations dashboard. Manage entities, track billing, and oversee contracts all in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {userModules.map((module) => {
              const items = getModuleData(module.id);
              const colors = colorMap[module.id] || colorMap['entity-management'];

              return (
                <div
                  key={module.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Module Header */}
                  <div className={`p-6 ${colors.bg} border-b ${colors.border}`}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-5xl flex-shrink-0">
                        {iconMap[module.id]}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {module.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {module.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={module.href}
                        className="flex-1 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors text-center"
                      >
                        View All
                      </Link>
                      <Link
                        href={module.id === 'entity-management' ? '/modules/entity-management/create-llc' : module.href}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
                      >
                        {module.id === 'entity-management' ? 'Create LLC' : 'Add New'}
                      </Link>
                    </div>
                  </div>

                  {/* Upcoming Items */}
                  <div className="p-6">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                      Coming Up
                    </h4>

                    {loading ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                      </div>
                    ) : items.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No upcoming items
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {item.primary}
                                </p>
                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                  {item.secondary}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs font-medium text-gray-700">
                                  {item.date}
                                </p>
                                <p
                                  className={`text-xs font-bold mt-0.5 ${
                                    item.days < 0
                                      ? 'text-red-600'
                                      : item.days <= 7
                                      ? 'text-orange-600'
                                      : item.days <= 30
                                      ? 'text-yellow-600'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  {item.days < 0
                                    ? 'Overdue'
                                    : item.days === 0
                                    ? 'Today'
                                    : `${item.days}d`}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-blue-600 to-indigo-600">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-700">LegalCore</span>
          </div>
          <p className="text-center text-sm text-gray-500">
            © 2024 LegalCore. All rights reserved. • Secure & Confidential
          </p>
        </div>
      </footer>

      <LedesChat context="general" />
    </div>
  );
}
