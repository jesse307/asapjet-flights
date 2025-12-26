'use client';

import { useState } from 'react';
import { Lead } from '@/types/lead';

interface CallLog {
  id: string;
  call_id: string;
  lead_id: string;
  status: string;
  timestamp: string;
  started_at?: string;
  ended_at?: string;
  duration?: number;
  cost?: number;
  error?: string;
}

export default function AdminLeadsPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/leads', {
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads);
        setIsAuthenticated(true);
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCallLogs(leadId: string) {
    try {
      const response = await fetch(`/api/admin/call-logs?leadId=${leadId}`, {
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCallLogs(data.callLogs || []);
      } else {
        console.error('Failed to fetch call logs');
        setCallLogs([]);
      }
    } catch (error) {
      console.error('Error fetching call logs:', error);
      setCallLogs([]);
    }
  }

  function handleViewDetails(lead: Lead) {
    setSelectedLead(lead);
    setCallLogs([]);
    fetchCallLogs(lead.id);
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-8 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#242424] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff6b35] text-white"
                placeholder="Enter admin password"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ff6b35] hover:bg-[#ff8555] disabled:bg-gray-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Lead Submissions</h1>
          <div className="text-gray-400">
            Total: {leads.length}
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            No leads submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-700 rounded-lg">
              <thead className="bg-[#242424]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Urgency</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Route</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date/Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">PAX</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-gray-700 hover:bg-[#242424]">
                    <td className="px-4 py-3 text-sm">
                      {new Date(lead.timestamp).toLocaleString('en-US', { timeZone: 'America/New_York' })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          lead.urgency === 'critical'
                            ? 'bg-red-900/30 text-red-200'
                            : lead.urgency === 'urgent'
                            ? 'bg-orange-900/30 text-orange-200'
                            : 'bg-gray-700 text-gray-200'
                        }`}
                      >
                        {lead.urgency}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{lead.name}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {lead.from_airport_or_city} → {lead.to_airport_or_city}
                    </td>
                    <td className="px-4 py-3 text-sm">{lead.date_time}</td>
                    <td className="px-4 py-3 text-sm">{lead.pax}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="text-xs">
                        <a href={`tel:${lead.phone}`} className="text-[#ff6b35] hover:underline block">
                          {lead.phone}
                        </a>
                        <a href={`mailto:${lead.email}`} className="text-[#ff6b35] hover:underline block">
                          {lead.email}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleViewDetails(lead)}
                        className="text-[#ff6b35] hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedLead && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold">Lead Details</h2>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="text-gray-400 hover:text-white text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Lead ID</div>
                    <div className="font-mono text-sm">{selectedLead.id}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">Submitted</div>
                    <div>{new Date(selectedLead.timestamp).toLocaleString('en-US', { timeZone: 'America/New_York' })} EST</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">Urgency</div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        selectedLead.urgency === 'critical'
                          ? 'bg-red-900/30 text-red-200'
                          : selectedLead.urgency === 'urgent'
                          ? 'bg-orange-900/30 text-orange-200'
                          : 'bg-gray-700 text-gray-200'
                      }`}
                    >
                      {selectedLead.urgency.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Name</div>
                      <div>{selectedLead.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Passengers</div>
                      <div>{selectedLead.pax}</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Phone</div>
                      <a href={`tel:${selectedLead.phone}`} className="text-[#ff6b35] hover:underline">
                        {selectedLead.phone}
                      </a>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Email</div>
                      <a href={`mailto:${selectedLead.email}`} className="text-[#ff6b35] hover:underline">
                        {selectedLead.email}
                      </a>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">From</div>
                    <div>{selectedLead.from_airport_or_city}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">To</div>
                    <div>{selectedLead.to_airport_or_city}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">Departure Date/Time</div>
                    <div>{selectedLead.date_time}</div>
                  </div>

                  {selectedLead.notes && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Notes</div>
                      <div className="bg-[#242424] border border-gray-700 rounded p-3">
                        {selectedLead.notes}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <div className="text-sm text-gray-400 mb-3">Call Logs</div>
                    {callLogs.length === 0 ? (
                      <div className="text-sm text-gray-500 italic">No phone calls logged for this lead</div>
                    ) : (
                      <div className="space-y-2">
                        {callLogs.map((log) => (
                          <div key={log.id} className="bg-[#242424] border border-gray-700 rounded p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-mono text-xs text-gray-400">Call ID: {log.call_id}</div>
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  log.status === 'completed'
                                    ? 'bg-green-900/30 text-green-200'
                                    : log.status === 'failed'
                                    ? 'bg-red-900/30 text-red-200'
                                    : log.status === 'in-progress'
                                    ? 'bg-blue-900/30 text-blue-200'
                                    : 'bg-gray-700 text-gray-200'
                                }`}
                              >
                                {log.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-400">Initiated:</span>{' '}
                                {new Date(log.timestamp).toLocaleString('en-US', { timeZone: 'America/New_York' })}
                              </div>
                              {log.started_at && (
                                <div>
                                  <span className="text-gray-400">Started:</span>{' '}
                                  {new Date(log.started_at).toLocaleString('en-US', { timeZone: 'America/New_York' })}
                                </div>
                              )}
                              {log.ended_at && (
                                <div>
                                  <span className="text-gray-400">Ended:</span>{' '}
                                  {new Date(log.ended_at).toLocaleString('en-US', { timeZone: 'America/New_York' })}
                                </div>
                              )}
                              {log.duration && (
                                <div>
                                  <span className="text-gray-400">Duration:</span> {log.duration}s
                                </div>
                              )}
                              {log.cost && (
                                <div>
                                  <span className="text-gray-400">Cost:</span> ${log.cost.toFixed(4)}
                                </div>
                              )}
                            </div>
                            {log.error && (
                              <div className="mt-2 text-xs text-red-300">
                                <span className="text-gray-400">Error:</span> {log.error}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
