'use client';

import { useState, useEffect } from 'react';

export default function HealthPage() {
  const [backendStatus, setBackendStatus] = useState<'loading' | 'healthy' | 'unhealthy'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
        const response = await fetch(`${apiUrl}/health`);
        
        if (response.ok) {
          setBackendStatus('healthy');
        } else {
          setBackendStatus('unhealthy');
          setError(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (err) {
        setBackendStatus('unhealthy');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    checkBackendHealth();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">System Health Check</h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Frontend Status</h2>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
            <span className="text-green-400">Next.js Frontend: Healthy</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Backend Status</h2>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              backendStatus === 'loading' ? 'bg-yellow-500' :
              backendStatus === 'healthy' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className={`${
              backendStatus === 'loading' ? 'text-yellow-400' :
              backendStatus === 'healthy' ? 'text-green-400' : 'text-red-400'
            }`}>
              Express Backend: {
                backendStatus === 'loading' ? 'Checking...' :
                backendStatus === 'healthy' ? 'Healthy' : 'Unhealthy'
              }
            </span>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-500/20 rounded border border-red-500/30">
              <p className="text-red-300 text-sm">Error: {error}</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-sm text-gray-400">
          <p>API URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}</p>
          <p>Environment: {process.env.NODE_ENV || 'development'}</p>
        </div>
      </div>
    </main>
  );
}