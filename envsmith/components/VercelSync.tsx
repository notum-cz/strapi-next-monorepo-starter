'use client';

import { useState } from 'react';

interface VercelSyncProps {
  secrets: Record<string, string>;
  onSync: (result: any) => void;
}

type Target = 'development' | 'preview' | 'production';

export default function VercelSync({ secrets, onSync }: VercelSyncProps) {
  const [token, setToken] = useState('');
  const [projectName, setProjectName] = useState('strapi-template-new-world-kids');
  const [teamSlug, setTeamSlug] = useState('jeremy-bowers-s-projects');
  const [targets, setTargets] = useState<Target[]>(['development']);
  const [loading, setLoading] = useState(false);
  const [smokeLoading, setSmokeLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleTargetToggle = (target: Target) => {
    setTargets((prev) =>
      prev.includes(target) ? prev.filter((t) => t !== target) : [...prev, target]
    );
  };

  const handleSync = async () => {
    if (!token || !projectName) {
      setError('Please fill in all required fields');
      return;
    }

    if (targets.length === 0) {
      setError('Please select at least one target environment');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const items = Object.entries(secrets).map(([key, value]) => ({
        key,
        value,
        target: targets,
        type: 'encrypted' as const,
      }));

      const syncRes = await fetch('/api/vercel/env/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          teamSlug: teamSlug || undefined,
          items,
          token,
        }),
      });

      const data = await syncRes.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to sync environment variables');
      }

      setResult(data);
      onSync(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSmokeTest = async () => {
    if (!token) {
      setError('Please enter your Vercel token');
      return;
    }

    setSmokeLoading(true);
    setError('');
    setResult(null);

    try {
      const smokeRes = await fetch('/api/vercel/env/smoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          teamSlug,
          token,
          target: 'development',
        }),
      });

      const data = await smokeRes.json();

      if (!data.success) {
        throw new Error(data.error || 'Smoke test failed');
      }

      setResult(data);
      onSync(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Smoke test failed');
    } finally {
      setSmokeLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">Sync to Vercel Project</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vercel Token *
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Get from vercel.com/account/tokens"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="my-project"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Slug
            </label>
            <input
              type="text"
              value={teamSlug}
              onChange={(e) => setTeamSlug(e.target.value)}
              placeholder="my-team"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Environments *
          </label>
          <div className="flex gap-2">
            {(['development', 'preview', 'production'] as Target[]).map((target) => (
              <button
                key={target}
                onClick={() => handleTargetToggle(target)}
                className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                  targets.includes(target)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                }`}
              >
                {target}
              </button>
            ))}
          </div>
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
          {result.synced && result.synced.length > 0 && (
            <p className="text-xs text-green-600 mt-1">
              Synced: {result.synced.join(', ')}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSync}
          disabled={loading || Object.keys(secrets).length === 0}
          className="flex-1 px-4 py-2 bg-black text-white font-medium rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Syncing...' : `Sync ${Object.keys(secrets).length} Variable(s)`}
        </button>

        <button
          onClick={handleSmokeTest}
          disabled={smokeLoading || !token}
          className="px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          title="Test by creating ENVSMITH_SMOKE_TEST=ok"
        >
          {smokeLoading ? 'Testing...' : 'Smoke Test'}
        </button>
      </div>
    </div>
  );
}
