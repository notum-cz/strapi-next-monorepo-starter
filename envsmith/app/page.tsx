'use client';

import { useState } from 'react';
import ChatComposer from '@/components/ChatComposer';
import SecretsTable from '@/components/SecretsTable';
import GitHubSync from '@/components/GitHubSync';
import VercelSync from '@/components/VercelSync';
import { type EnvEntry } from '@/lib/envgen';

export default function Home() {
  const [envContent, setEnvContent] = useState('');
  const [variables, setVariables] = useState<EnvEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (stack: string[], overrides: Record<string, string>) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stack,
          overrides,
          includeComments: true,
          includeDefaults: false,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate .env');
      }

      setEnvContent(data.content);
      setVariables(data.variables);

      if (data.warnings.length > 0) {
        console.warn('Warnings:', data.warnings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVariables = (updated: EnvEntry[]) => {
    setVariables(updated);

    // Regenerate content
    const lines: string[] = [];
    for (const variable of updated) {
      if (variable.comment) {
        lines.push(`# ${variable.comment}`);
      }
      lines.push(`${variable.key}=${variable.value}`);
      lines.push('');
    }
    setEnvContent(lines.join('\n'));
  };

  const handleDownload = () => {
    const blob = new Blob([envContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(envContent);
      alert('Copied to clipboard!');
    } catch (err) {
      alert('Failed to copy to clipboard');
    }
  };

  const secretsObject = variables.reduce((acc, v) => {
    if (v.value) {
      acc[v.key] = v.value;
    }
    return acc;
  }, {} as Record<string, string>);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            EnvSmith
          </h1>
          <p className="text-lg text-gray-600">
            Generate .env files and sync secrets to GitHub and Vercel
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Generation */}
          <div className="space-y-6">
            {/* Chat Composer */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Generate Environment Variables
              </h2>
              <ChatComposer onGenerate={handleGenerate} />
            </div>

            {/* Preview and Actions */}
            {envContent && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    2. Preview & Download
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      Copy
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-3 py-1 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                    >
                      Download .env
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400 font-mono whitespace-pre">
                    {envContent}
                  </pre>
                </div>
              </div>
            )}

            {/* Secrets Table */}
            {variables.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <SecretsTable variables={variables} onUpdate={handleUpdateVariables} />
              </div>
            )}
          </div>

          {/* Right Column: Sync */}
          <div className="space-y-6">
            {/* GitHub Sync */}
            {Object.keys(secretsObject).length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  3. Sync to Platforms
                </h2>
                <GitHubSync
                  secrets={secretsObject}
                  onSync={(result) => {
                    console.log('GitHub sync result:', result);
                  }}
                />
              </div>
            )}

            {/* Vercel Sync */}
            {Object.keys(secretsObject).length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <VercelSync
                  secrets={secretsObject}
                  onSync={(result) => {
                    console.log('Vercel sync result:', result);
                  }}
                />
              </div>
            )}

            {/* Info Panel */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Security Notes
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">🔒</span>
                  <span>All processing happens in-memory. No secrets are stored.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🚫</span>
                  <span>Secret values are never logged or sent to analytics.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🔐</span>
                  <span>GitHub secrets are encrypted using libsodium sealed boxes.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Vercel variables use encrypted type by default.</span>
                </li>
              </ul>
            </div>

            {/* Usage Info */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Quick Start
              </h3>
              <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                <li>Select one or more templates</li>
                <li>Edit variable values in the table</li>
                <li>Download .env file or sync to platforms</li>
                <li>For GitHub: Create a PAT with <code className="bg-gray-100 px-1 rounded">repo</code> scope</li>
                <li>For Vercel: Get token from <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">vercel.com/account/tokens</a></li>
              </ol>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700">Generating...</p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            EnvSmith · Secure environment variable management · No data stored
          </p>
        </footer>
      </div>
    </main>
  );
}
