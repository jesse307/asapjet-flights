'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Recommendation {
  id: string;
  type: 'budget_change' | 'pause_campaign' | 'keyword_add' | 'keyword_remove' | 'new_ad_copy';
  campaign_id?: string;
  campaign_name?: string;
  details: any;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  status: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: number;
  cpc: number;
  costPerConversion: number;
}

export default function MarketingDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'keywords' | 'history'>('overview');

  const [metrics, setMetrics] = useState<CampaignMetrics[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<string[]>([
    'last minute private jet',
    'emergency charter flight',
    'same day private flight',
    'urgent air charter',
    'asap private jet booking',
  ]);
  const [newKeyword, setNewKeyword] = useState('');
  const [runningOptimization, setRunningOptimization] = useState(false);

  useEffect(() => {
    const password = sessionStorage.getItem('admin_password');
    if (password) {
      setIsAuthenticated(true);
      loadData();
    } else {
      window.location.href = '/admin';
    }
  }, []);

  async function loadData() {
    setIsLoading(true);
    const password = sessionStorage.getItem('admin_password');

    try {
      // Load optimization history/recommendations
      const historyRes = await fetch('/api/admin/marketing/history', {
        headers: { 'Authorization': `Bearer ${password}` },
      });
      if (historyRes.ok) {
        const data = await historyRes.json();
        setHistory(data.history || []);
        setRecommendations(data.pending || []);
      }

      // Load current metrics
      const metricsRes = await fetch('/api/admin/marketing/metrics', {
        headers: { 'Authorization': `Bearer ${password}` },
      });
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data.campaigns || []);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function runOptimization() {
    setRunningOptimization(true);
    const password = sessionStorage.getItem('admin_password');

    try {
      const res = await fetch('/api/marketing/optimize', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${password}` },
      });
      const data = await res.json();
      alert(data.status === 'success'
        ? `Optimization complete! ${data.summary?.actionsApplied || 0} actions applied.`
        : `Error: ${data.error}`
      );
      loadData();
    } catch (err) {
      alert('Failed to run optimization');
    } finally {
      setRunningOptimization(false);
    }
  }

  async function handleApproval(id: string, approved: boolean) {
    const password = sessionStorage.getItem('admin_password');

    try {
      await fetch('/api/admin/marketing/approve', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, approved }),
      });
      loadData();
    } catch (err) {
      alert('Failed to process approval');
    }
  }

  function addKeyword() {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim().toLowerCase())) {
      setKeywords([...keywords, newKeyword.trim().toLowerCase()]);
      setNewKeyword('');
    }
  }

  function removeKeyword(keyword: string) {
    setKeywords(keywords.filter(k => k !== keyword));
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen px-4 py-8 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-gray-400 hover:text-white text-sm mb-2 inline-block">
              ← Back to Admin
            </Link>
            <h1 className="text-3xl font-bold">Marketing AI Dashboard</h1>
            <p className="text-gray-400">Manage campaigns, review AI recommendations, and optimize performance</p>
          </div>
          <button
            onClick={runOptimization}
            disabled={runningOptimization}
            className="bg-[#ff6b35] hover:bg-[#ff8555] disabled:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            {runningOptimization ? 'Running...' : 'Run Optimization Now'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700">
          {(['overview', 'recommendations', 'keywords', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-[#ff6b35] border-b-2 border-[#ff6b35]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Active Campaigns</div>
                    <div className="text-2xl font-bold">{metrics.filter(m => m.status === 'ENABLED').length}</div>
                  </div>
                  <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Total Spend (7d)</div>
                    <div className="text-2xl font-bold">${metrics.reduce((sum, m) => sum + m.cost, 0).toFixed(2)}</div>
                  </div>
                  <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Total Clicks (7d)</div>
                    <div className="text-2xl font-bold">{metrics.reduce((sum, m) => sum + m.clicks, 0)}</div>
                  </div>
                  <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Conversions (7d)</div>
                    <div className="text-2xl font-bold">{metrics.reduce((sum, m) => sum + m.conversions, 0)}</div>
                  </div>
                </div>

                {/* Campaign Table */}
                <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-700">
                    <h2 className="font-semibold">Campaign Performance (Last 7 Days)</h2>
                  </div>
                  {metrics.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      No campaign data yet. Complete the Google Ads setup to see performance metrics.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[#242424]">
                          <tr>
                            <th className="text-left px-4 py-3 font-medium text-gray-400">Campaign</th>
                            <th className="text-right px-4 py-3 font-medium text-gray-400">Status</th>
                            <th className="text-right px-4 py-3 font-medium text-gray-400">Impressions</th>
                            <th className="text-right px-4 py-3 font-medium text-gray-400">Clicks</th>
                            <th className="text-right px-4 py-3 font-medium text-gray-400">CTR</th>
                            <th className="text-right px-4 py-3 font-medium text-gray-400">CPC</th>
                            <th className="text-right px-4 py-3 font-medium text-gray-400">Conv.</th>
                            <th className="text-right px-4 py-3 font-medium text-gray-400">CPL</th>
                            <th className="text-right px-4 py-3 font-medium text-gray-400">Spend</th>
                          </tr>
                        </thead>
                        <tbody>
                          {metrics.map(campaign => (
                            <tr key={campaign.campaignId} className="border-t border-gray-800 hover:bg-[#242424]">
                              <td className="px-4 py-3 font-medium">{campaign.campaignName}</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  campaign.status === 'ENABLED' ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'
                                }`}>
                                  {campaign.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">{campaign.impressions.toLocaleString()}</td>
                              <td className="px-4 py-3 text-right">{campaign.clicks.toLocaleString()}</td>
                              <td className="px-4 py-3 text-right">{campaign.ctr.toFixed(2)}%</td>
                              <td className="px-4 py-3 text-right">${campaign.cpc.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right">{campaign.conversions}</td>
                              <td className="px-4 py-3 text-right">
                                <span className={campaign.costPerConversion > 30 ? 'text-red-400' : campaign.costPerConversion > 0 ? 'text-green-400' : ''}>
                                  {campaign.costPerConversion > 0 ? `$${campaign.costPerConversion.toFixed(2)}` : '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">${campaign.cost.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === 'recommendations' && (
              <div className="space-y-4">
                <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
                  <h2 className="font-semibold mb-2">Pending AI Recommendations</h2>
                  <p className="text-gray-400 text-sm">Review and approve/reject AI suggestions before they are applied</p>
                </div>

                {recommendations.length === 0 ? (
                  <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-8 text-center text-gray-400">
                    No pending recommendations. The AI will generate suggestions during optimization runs.
                  </div>
                ) : (
                  recommendations.map(rec => (
                    <div key={rec.id} className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              rec.type === 'budget_change' ? 'bg-blue-900/30 text-blue-400' :
                              rec.type === 'pause_campaign' ? 'bg-red-900/30 text-red-400' :
                              rec.type === 'new_ad_copy' ? 'bg-purple-900/30 text-purple-400' :
                              'bg-gray-700 text-gray-400'
                            }`}>
                              {rec.type.replace('_', ' ').toUpperCase()}
                            </span>
                            {rec.campaign_name && (
                              <span className="text-gray-400 text-sm">{rec.campaign_name}</span>
                            )}
                          </div>
                          <p className="font-medium mb-1">{rec.reason}</p>
                          <pre className="text-sm text-gray-400 bg-[#0a0a0a] p-2 rounded mt-2 overflow-x-auto">
                            {JSON.stringify(rec.details, null, 2)}
                          </pre>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleApproval(rec.id, true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproval(rec.id, false)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Keywords Tab */}
            {activeTab === 'keywords' && (
              <div className="space-y-6">
                <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
                  <h2 className="font-semibold mb-2">Target Keywords</h2>
                  <p className="text-gray-400 text-sm">
                    These high-intent keywords are what the AI focuses on for optimization.
                    The AI will suggest adding or removing keywords based on performance.
                  </p>
                </div>

                {/* Add Keyword */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                    placeholder="Add a new keyword..."
                    className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff6b35] text-white"
                  />
                  <button
                    onClick={addKeyword}
                    className="bg-[#ff6b35] hover:bg-[#ff8555] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Keyword List */}
                <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg divide-y divide-gray-700">
                  {keywords.map(keyword => (
                    <div key={keyword} className="flex items-center justify-between px-4 py-3">
                      <span className="font-medium">{keyword}</span>
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
                  <h2 className="font-semibold mb-2">AI Decision History</h2>
                  <p className="text-gray-400 text-sm">All actions taken by the Marketing AI are logged here for transparency</p>
                </div>

                {history.length === 0 ? (
                  <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-8 text-center text-gray-400">
                    No history yet. Run an optimization to see AI decisions logged here.
                  </div>
                ) : (
                  <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg divide-y divide-gray-700">
                    {history.map((item, i) => (
                      <div key={i} className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.applied ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                          }`}>
                            {item.applied ? 'APPLIED' : 'LOGGED'}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="font-medium">{item.action_type?.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-gray-400 text-sm">{item.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
