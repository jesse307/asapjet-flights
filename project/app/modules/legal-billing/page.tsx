'use client';

import Header from '@/components/Header';
import Link from 'next/link';
import LedesChat from '@/components/LedesChat';
import { User, LegalBill } from '@/types';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

const mockUser: User = {
  id: '1',
  name: 'Ryan Manitoba',
  email: 'ryan.manitoba@company.com',
  role: 'manager',
  department: 'Legal',
};

export default function LegalBillingPage() {
  const [bills, setBills] = useState<LegalBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    async function fetchBills() {
      try {
        const { data, error } = await supabase
          .from('legal_bills')
          .select('*')
          .order('due_date', { ascending: true });

        if (error) {
          console.error('Error fetching bills:', error);
        } else {
          setBills(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBills();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTotalAmount = () => {
    return bills.reduce((sum, bill) => sum + bill.amount, 0);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (dueDate: string) => {
    const days = getDaysUntilDue(dueDate);
    if (days < 0) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Overdue</span>;
    } else if (days <= 7) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Due Soon</span>;
    } else if (days <= 30) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Due This Month</span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Upcoming</span>;
    }
  };

  const handleSync = () => {
    setSyncing(true);
    setSyncMessage('');
    setTimeout(() => {
      setSyncing(false);
      setSyncMessage('Sync Complete');
      setTimeout(() => setSyncMessage(''), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={mockUser} />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="text-5xl">💰</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Legal Billing
              </h1>
              <p className="text-lg text-gray-600">
                Track legal expenses, manage vendor invoices, and monitor department budgets
              </p>
            </div>
          </div>

          {!loading && bills.length > 0 && (
            <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-900">Total Outstanding</p>
                  <p className="text-2xl font-bold text-emerald-700">{formatCurrency(getTotalAmount())}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-900">Invoices</p>
                  <p className="text-2xl font-bold text-emerald-700">{bills.length}</p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Pending Invoices</h2>
              <div className="flex items-center gap-3">
                {syncMessage && (
                  <span className="text-sm text-green-600 font-medium">{syncMessage}</span>
                )}
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="inline-flex items-center px-4 py-2 border border-emerald-600 text-sm font-medium rounded-md text-emerald-600 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {syncing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Sync with Mitratech
                    </>
                  )}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading invoices...</div>
              </div>
            ) : bills.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">No invoices found. Please run the seed script in Supabase.</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Law Firm
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice #
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{bill.law_firm_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{bill.invoice_number}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs truncate">{bill.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{formatCurrency(bill.amount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(bill.due_date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(bill.due_date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <LedesChat context="billing" />
    </div>
  );
}
