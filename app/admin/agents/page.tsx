'use client';

import { useState, useEffect } from 'react';
import type { Agent, AgentInput } from '@/types/agent';

export default function AgentsAdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  // Form state
  const [formData, setFormData] = useState<AgentInput>({
    name: '',
    email: '',
    phone: '',
    on_call: false,
    active: true,
  });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/admin/agents', {
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents);
        setIsAuthenticated(true);
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  async function fetchAgents() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/agents', {
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch agents');
      }

      setAgents(data.agents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      if (editingAgent) {
        // Update existing agent
        const response = await fetch(`/api/admin/agents/${editingAgent.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${password}`,
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update agent');
        }
      } else {
        // Create new agent
        const response = await fetch('/api/admin/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${password}`,
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create agent');
        }
      }

      // Reset form and refresh list
      setFormData({ name: '', email: '', phone: '', on_call: false, active: true });
      setShowAddForm(false);
      setEditingAgent(null);
      await fetchAgents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/agents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete agent');
      }

      await fetchAgents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  async function handleToggleOnCall(agent: Agent) {
    try {
      const response = await fetch(`/api/admin/agents/${agent.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
        },
        body: JSON.stringify({ on_call: !agent.on_call }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update on-call status');
      }

      await fetchAgents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  function startEdit(agent: Agent) {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      on_call: agent.on_call,
      active: agent.active,
    });
    setShowAddForm(true);
  }

  function cancelEdit() {
    setEditingAgent(null);
    setFormData({ name: '', email: '', phone: '', on_call: false, active: true });
    setShowAddForm(false);
  }

  const onCallAgent = agents.find(a => a.on_call);

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <h1 className="text-4xl font-bold mb-8 text-center">Agent Management</h1>
          <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Admin Login</h2>
            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff6b35] text-white"
                  placeholder="Enter admin password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff6b35] hover:bg-[#ff8555] disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Agent Management</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#ff6b35] hover:bg-[#ff8555] px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {showAddForm ? 'Cancel' : 'Add Agent'}
          </button>
        </div>

        {/* On-call agent banner */}
        {onCallAgent && (
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-1">Currently On Call</h2>
            <p className="text-green-200">
              {onCallAgent.name} ({onCallAgent.email}) - {onCallAgent.phone}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingAgent ? 'Edit Agent' : 'Add New Agent'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff6b35] text-white"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff6b35] text-white"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff6b35] text-white"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.on_call}
                    onChange={(e) => setFormData({ ...formData, on_call: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span>On Call</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-[#ff6b35] hover:bg-[#ff8555] px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {editingAgent ? 'Update Agent' : 'Create Agent'}
                </button>
                {editingAgent && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Agents List */}
        <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#242424] border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">On Call</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    Loading agents...
                  </td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No agents found. Add your first agent to get started.
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent.id} className="border-b border-gray-800 hover:bg-[#242424]">
                    <td className="px-6 py-4">{agent.name}</td>
                    <td className="px-6 py-4">{agent.email}</td>
                    <td className="px-6 py-4">{agent.phone}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          agent.active
                            ? 'bg-green-900/30 text-green-400 border border-green-700'
                            : 'bg-gray-700/30 text-gray-400 border border-gray-600'
                        }`}
                      >
                        {agent.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleOnCall(agent)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          agent.on_call
                            ? 'bg-[#ff6b35] text-white hover:bg-[#ff8555]'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {agent.on_call ? 'On Call' : 'Set On Call'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => startEdit(agent)}
                        className="text-blue-400 hover:text-blue-300 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(agent.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
