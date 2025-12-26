'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Test authentication by trying to fetch leads
      const response = await fetch('/api/admin/leads', {
        headers: {
          'Authorization': `Bearer ${password}`,
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
        // Store password in sessionStorage for child pages
        sessionStorage.setItem('admin_password', password);
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Authentication failed');
    } finally {
      setIsLoading(false);
    }
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">ASAP Jet Admin</h1>
          <p className="text-gray-400">Manage leads and agents</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Lead Management Card */}
          <Link
            href="/admin/leads"
            className="block bg-[#1a1a1a] border border-gray-700 rounded-lg p-6 hover:border-[#ff6b35] transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-[#ff6b35]/10 p-3 rounded-lg">
                <svg
                  className="w-6 h-6 text-[#ff6b35]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-[#ff6b35] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Lead Management</h2>
            <p className="text-gray-400 text-sm">
              View all charter lead submissions, contact information, and call logs
            </p>
          </Link>

          {/* Agent Management Card */}
          <Link
            href="/admin/agents"
            className="block bg-[#1a1a1a] border border-gray-700 rounded-lg p-6 hover:border-[#ff6b35] transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-[#ff6b35]/10 p-3 rounded-lg">
                <svg
                  className="w-6 h-6 text-[#ff6b35]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-[#ff6b35] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Agent Management</h2>
            <p className="text-gray-400 text-sm">
              Manage sales agents and configure on-call notifications
            </p>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setPassword('');
              sessionStorage.removeItem('admin_password');
            }}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}
