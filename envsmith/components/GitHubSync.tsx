'use client';

import { useState } from 'react';

interface GitHubSyncProps {
  secrets: Record<string, string>;
  onSync: (result: any) => void;
}

export default function GitHubSync({ secrets, onSync }: GitHubSyncProps) {
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [environment, setEnvironment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleSync = async () => {
    if (!token || !owner || !repo) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Validate token first
      const connectRes = await fetch('/api/github/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenType: 'pat', token }),
      });

      if (!connectRes.ok) {
        const data = await connectRes.json();
        throw new Error(data.error || 'Invalid GitHub token');
      }

      // Sync secrets
      const syncRes = await fetch('/api/github/secrets/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          repo,
          environment: environment || undefined,
          secrets,
          token,
        }),
      });

      const data = await syncRes.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to sync secrets');
      }

      setResult(data);
      onSync(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">Sync to GitHub Actions Secrets</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Personal Access Token *
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Requires <code className="bg-gray-100 px-1 rounded">repo</code> scope
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner *
            </label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="username or org"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repository *
            </label>
            <input
              type="text"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="repo-name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Environment (optional)
          </label>
          <input
            type="text"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            placeholder="production, staging, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Leave empty for repository-level secrets
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700 font-medium">{result.message}</p>
          {result.synced.length > 0 && (
            <p className="text-xs text-green-600 mt-1">
              Synced: {result.synced.join(', ')}
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleSync}
        disabled={loading || Object.keys(secrets).length === 0}
        className="w-full px-4 py-2 bg-gray-800 text-white font-medium rounded-md hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Syncing...' : `Sync ${Object.keys(secrets).length} Secret(s) to GitHub`}
      </button>
    </div>
  );
}
