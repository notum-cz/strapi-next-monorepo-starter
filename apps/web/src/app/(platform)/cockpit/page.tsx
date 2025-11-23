// ============================================================================
// Stellar Cockpit - FUTURISTIC GAME-STYLE Dashboard
// Video game graphics meets elegant nonprofit management
// ============================================================================

'use client';

import { useAgents } from '@/hooks/useAgents';
import { AgentCardGame } from '@/components/cockpit/GameUI/AgentCardGame';
import { LiveLogsViewer } from '@/components/cockpit/LiveLogsViewer';
import { VoiceCommandGame } from '@/components/cockpit/GameUI/VoiceCommandGame';
import { StarField3D } from '@/components/cockpit/GameUI/StarField3D';
import { NonprofitImpactHUD } from '@/components/cockpit/GameUI/NonprofitImpactHUD';
import { AgentCardSkeleton } from '@/components/ui/game-skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Users, TrendingUp, Heart, Eye, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

export default function CockpitDashboard() {
  const { data: agents, isLoading, error, refetch } = useAgents();
  const [stats, setStats] = useState({ totalTasks: 0, successRate: 97, activeAgents: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch stats from API
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/agents/stats');
      const data = await response.json();
      if (data.success) {
        const totalTasks = data.agents.reduce((sum: number, a: any) => sum + a.stats.tasksCompleted, 0);
        const avgSuccess = data.agents.reduce((sum: number, a: any) => sum + a.stats.successRate, 0) / data.agents.length;
        setStats({
          totalTasks,
          successRate: Math.round(avgSuccess),
          activeAgents: data.agents.filter((a: any) => a.status === 'online' || a.status === 'busy').length,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetch(), fetchStats()]);
    setIsRefreshing(false);
  };

  // Mock agents data if database isn't ready
  const mockAgents = [
    {
      id: '1',
      name: 'Sirius',
      displayName: 'Sirius - The Navigator',
      type: 'orchestrator',
      status: 'online' as const,
      description: 'Plans and organizes your projects. Your personal project manager.',
      capabilities: ['Task Planning', 'Team Coordination', 'Workflow Design', 'Decision Making'],
      stats: { tasksCompleted: 247, successRate: 98, avgResponseTime: '1.2s' },
    },
    {
      id: '2',
      name: 'Andromeda',
      displayName: 'Andromeda - The Coder',
      type: 'coding',
      status: 'online' as const,
      description: 'Builds websites, forms, and features. Your developer on demand.',
      capabilities: ['Web Development', 'Form Building', 'Bug Fixing', 'Feature Creation'],
      stats: { tasksCompleted: 189, successRate: 96, avgResponseTime: '2.4s' },
    },
    {
      id: '3',
      name: 'Vega',
      displayName: 'Vega - The Validator',
      type: 'browsing',
      status: 'busy' as const,
      description: 'Tests everything to ensure perfection. Your quality assurance expert.',
      capabilities: ['UI Testing', 'Mobile Check', 'Link Verification', 'Performance Testing'],
      stats: { tasksCompleted: 312, successRate: 99, avgResponseTime: '0.8s' },
    },
    {
      id: '4',
      name: 'Rigel',
      displayName: 'Rigel - The Researcher',
      type: 'browsing',
      status: 'online' as const,
      description: 'Finds information and researches topics. Your personal researcher.',
      capabilities: ['Web Research', 'Data Analysis', 'Grant Finding', 'Best Practices'],
      stats: { tasksCompleted: 156, successRate: 94, avgResponseTime: '3.1s' },
    },
    {
      id: '5',
      name: 'Cassiopeia',
      displayName: 'Cassiopeia - The Communicator',
      type: 'voice',
      status: 'online' as const,
      description: 'Explains things clearly and helps with communication. Your translator.',
      capabilities: ['Clear Explanations', 'Report Writing', 'Summarization', 'Translation'],
      stats: { tasksCompleted: 421, successRate: 97, avgResponseTime: '1.5s' },
    },
    {
      id: '6',
      name: 'Betelgeuse',
      displayName: 'Betelgeuse - The Builder',
      type: 'hybrid',
      status: 'online' as const,
      description: 'Launches and manages your services. Your IT specialist.',
      capabilities: ['Service Deployment', 'Website Hosting', 'Database Management', 'Monitoring'],
      stats: { tasksCompleted: 98, successRate: 95, avgResponseTime: '4.2s' },
    },
  ];

  const displayAgents = agents && agents.length > 0 ? agents : mockAgents;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 3D Star Field Background */}
      <StarField3D />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Header - Futuristic HUD Style */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden border-b border-cyan-500/20 bg-gradient-to-br from-slate-900/80 via-purple-900/40 to-slate-900/80 backdrop-blur-xl"
        >
          {/* Animated scan line */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          />

          <div className="mx-auto max-w-7xl px-8 py-12">
            <div className="flex items-start justify-between">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-2 flex items-center gap-2"
                >
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-mono text-green-400 uppercase tracking-wider">
                    System Online
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-bold text-5xl md:text-6xl mb-3"
                >
                  Mission Control
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-slate-300 max-w-2xl"
                >
                  <span className="text-cyan-400 font-semibold">Voice-activated</span> AI agents helping your nonprofit make <span className="text-purple-400 font-semibold">real impact</span>. Just speak naturally!
                </motion.p>
              </div>

              {/* Navigation Pills */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-3"
              >
                <Link
                  href="/cockpit"
                  className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  <Zap className="w-4 h-4 inline mr-2" />
                  Dashboard
                  <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link
                  href="/cockpit/observability"
                  className="px-6 py-3 bg-slate-800/50 backdrop-blur rounded-xl font-semibold text-slate-300 border border-slate-700/50 hover:border-cyan-500/50 hover:text-white transition-all flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Activity Logs
                </Link>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-3 bg-slate-800/50 backdrop-blur rounded-xl text-slate-300 border border-slate-700/50 hover:border-cyan-500/50 hover:text-white transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </motion.div>
            </div>

            {/* Quick Stats - Game HUD Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition" />
                <div className="relative bg-slate-900/80 backdrop-blur rounded-xl p-4 border border-cyan-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Agents</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{displayAgents.length}</div>
                  <div className="text-xs text-cyan-400">All systems go</div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition" />
                <div className="relative bg-slate-900/80 backdrop-blur rounded-xl p-4 border border-green-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Active</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {displayAgents.filter(a => a.status === 'online' || a.status === 'busy').length}
                  </div>
                  <div className="text-xs text-green-400">Ready to help</div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition" />
                <div className="relative bg-slate-900/80 backdrop-blur rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Success</span>
                  </div>
                  <motion.div
                    key={stats.successRate}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-white"
                  >
                    {stats.successRate}%
                  </motion.div>
                  <div className="text-xs text-purple-400">Task completion</div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition" />
                <div className="relative bg-slate-900/80 backdrop-blur rounded-xl p-4 border border-pink-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span className="text-xs text-slate-400 uppercase tracking-wide">Impact</span>
                  </div>
                  <motion.div
                    key={stats.totalTasks}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-white"
                  >
                    {stats.totalTasks > 1000 ? `${(stats.totalTasks / 1000).toFixed(1)}K+` : stats.totalTasks || '1.2K+'}
                  </motion.div>
                  <div className="text-xs text-pink-400">Tasks completed</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="mx-auto max-w-7xl px-8 py-12">
          {/* Agent Cards - Game Character Select Style */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Your AI Team</h2>
                <p className="text-slate-400">Click any agent to see details, or just speak your command!</p>
              </div>
            </div>

            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <AgentCardSkeleton key={i} />
                ))}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/50 bg-red-900/20 p-6 backdrop-blur">
                <div className="text-red-400">
                  <span className="font-bold">System Error:</span> {error.message}
                </div>
                <div className="mt-2 text-sm text-red-300">
                  Using simulated agent data. Apply Supabase migration for live data.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayAgents.map((agent, i) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  <AgentCardGame
                    agent={agent as any}
                    onClick={() => window.location.href = `/cockpit/agents/${agent.name.toLowerCase()}`}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Live Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">Live Activity Feed</h2>
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-xl overflow-hidden">
              <LiveLogsViewer />
            </div>
          </motion.div>

          {/* Impact Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="mt-12"
          >
            <NonprofitImpactHUD />
          </motion.div>
        </div>
      </div>

      {/* Floating Voice Command - Game-style Radial Menu */}
      <VoiceCommandGame />
    </div>
  );
}
