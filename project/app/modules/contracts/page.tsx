'use client';

import Header from '@/components/Header';
import Link from 'next/link';
import LedesChat from '@/components/LedesChat';
import { User, Contract, ContractPlaybook } from '@/types';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

const mockUser: User = {
  id: '1',
  name: 'Ryan Manitoba',
  email: 'ryan.manitoba@company.com',
  role: 'manager',
  department: 'Legal',
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [playbook, setPlaybook] = useState<ContractPlaybook[]>([]);
  const [loading, setLoading] = useState(true);
  const [playbookLoading, setPlaybookLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'contracts' | 'playbook'>('contracts');
  const [filterPosition, setFilterPosition] = useState<'all' | 'accept' | 'reject' | 'negotiate'>('all');

  useEffect(() => {
    async function fetchContracts() {
      try {
        const { data, error } = await supabase
          .from('contracts')
          .select('*')
          .order('expiration_date', { ascending: true });

        if (error) {
          console.error('Error fetching contracts:', error);
        } else {
          setContracts(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchContracts();
  }, []);

  useEffect(() => {
    async function fetchPlaybook() {
      try {
        const { data, error } = await supabase
          .from('contract_playbook')
          .select('*')
          .order('clause_category', { ascending: true });

        if (error) {
          console.error('Error fetching playbook:', error);
        } else {
          setPlaybook(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setPlaybookLoading(false);
      }
    }

    fetchPlaybook();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDaysUntilExpiration = (expirationDate: string) => {
    const today = new Date();
    const expiration = new Date(expirationDate);
    const diffTime = expiration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpirationBadge = (expirationDate: string) => {
    const days = getDaysUntilExpiration(expirationDate);
    if (days < 0) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span>;
    } else if (days <= 30) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Expiring Soon</span>;
    } else if (days <= 90) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Expiring in {days} days</span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
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

  const getPositionBadge = (position: string) => {
    switch (position) {
      case 'accept':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Accept</span>;
      case 'reject':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Reject</span>;
      case 'negotiate':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Negotiate</span>;
      default:
        return null;
    }
  };

  const filteredPlaybook = filterPosition === 'all'
    ? playbook
    : playbook.filter(item => item.position === filterPosition);

  const playbookByCategory = filteredPlaybook.reduce((acc, item) => {
    if (!acc[item.clause_category]) {
      acc[item.clause_category] = [];
    }
    acc[item.clause_category].push(item);
    return acc;
  }, {} as Record<string, ContractPlaybook[]>);

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
            <div className="text-5xl">📄</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Contracts
              </h1>
              <p className="text-lg text-gray-600">
                Create, review, and manage legal contracts and agreements
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('contracts')}
                className={`${
                  activeTab === 'contracts'
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Contract Portfolio
              </button>
              <button
                onClick={() => setActiveTab('playbook')}
                className={`${
                  activeTab === 'playbook'
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Contracts Playbook
              </button>
            </nav>
          </div>

          {/* Contract Portfolio Tab */}
          {activeTab === 'contracts' && (
            <>
              {!loading && contracts.length > 0 && (
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
                    <p className="text-sm font-medium text-violet-900">Total Contracts</p>
                    <p className="text-2xl font-bold text-violet-700">{contracts.length}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium text-orange-900">Expiring Soon</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {contracts.filter(c => getDaysUntilExpiration(c.expiration_date) <= 90 && getDaysUntilExpiration(c.expiration_date) >= 0).length}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-900">Active</p>
                    <p className="text-2xl font-bold text-green-700">
                      {contracts.filter(c => c.status === 'active').length}
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Contract Portfolio</h2>
              <div className="flex items-center gap-3">
                {syncMessage && (
                  <span className="text-sm text-green-600 font-medium">{syncMessage}</span>
                )}
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="inline-flex items-center px-4 py-2 border border-violet-600 text-sm font-medium rounded-md text-violet-600 bg-white hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {syncing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-violet-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                      Sync with Ironclad
                    </>
                  )}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading contracts...</div>
              </div>
            ) : contracts.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">No contracts found. Please run the seed script in Supabase.</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contract Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Counterparty
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiration Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Auto-Renew
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{contract.contract_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{contract.contract_type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contract.counterparty}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{formatCurrency(contract.value)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(contract.expiration_date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {contract.auto_renew ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Yes</span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">No</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getExpirationBadge(contract.expiration_date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
              </div>
            </>
          )}

          {/* Playbook Tab */}
          {activeTab === 'playbook' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Redline Guidance</h2>
                  <p className="text-sm text-gray-600 mt-1">Standard positions on common contract clauses</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={filterPosition}
                    onChange={(e) => setFilterPosition(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="all">All Positions</option>
                    <option value="accept">Accept</option>
                    <option value="reject">Reject</option>
                    <option value="negotiate">Negotiate</option>
                  </select>
                </div>
              </div>

              {playbookLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">Loading playbook...</div>
                </div>
              ) : filteredPlaybook.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">No playbook items found.</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(playbookByCategory).map(([category, items]) => (
                    <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{category}</h3>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {items.map((item) => (
                          <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="text-base font-semibold text-gray-900 mb-1">{item.clause_name}</h4>
                                {getPositionBadge(item.position)}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{item.guidance}</p>
                            {item.example_language && (
                              <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Example Language</p>
                                <p className="text-sm text-gray-600 italic">{item.example_language}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-900 mb-1">About This Playbook</h4>
                    <p className="text-sm text-blue-700">
                      This playbook provides standard guidance for contract negotiations. Always consult with your legal team for specific situations and consider the business context when applying these guidelines.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <LedesChat context="contracts" />
    </div>
  );
}
