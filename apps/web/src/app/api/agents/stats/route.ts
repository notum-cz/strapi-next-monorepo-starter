/**
 * API Route: Agent Statistics
 * Real-time agent performance metrics and stats
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface AgentStats {
  id: string
  name: string
  displayName: string
  type: string
  status: 'online' | 'busy' | 'offline' | 'error'
  description: string
  capabilities: string[]
  stats: {
    tasksCompleted: number
    successRate: number
    avgResponseTime: string
    lastActive: string
  }
  isDemo: boolean
}

const AGENT_CONFIGS = {
  Sirius: {
    displayName: 'Sirius - The Navigator',
    type: 'orchestrator',
    description: 'Plans and organizes your projects. Your personal project manager.',
    capabilities: ['Task Planning', 'Team Coordination', 'Workflow Design', 'Decision Making'],
  },
  Andromeda: {
    displayName: 'Andromeda - The Coder',
    type: 'coding',
    description: 'Builds websites, forms, and features. Your developer on demand.',
    capabilities: ['Web Development', 'Form Building', 'Bug Fixing', 'Feature Creation'],
  },
  Vega: {
    displayName: 'Vega - The Validator',
    type: 'browsing',
    description: 'Tests everything to ensure perfection. Your quality assurance expert.',
    capabilities: ['UI Testing', 'Mobile Check', 'Link Verification', 'Performance Testing'],
  },
  Rigel: {
    displayName: 'Rigel - The Researcher',
    type: 'browsing',
    description: 'Finds information and researches topics. Your personal researcher.',
    capabilities: ['Web Research', 'Data Analysis', 'Grant Finding', 'Best Practices'],
  },
  Cassiopeia: {
    displayName: 'Cassiopeia - The Communicator',
    type: 'voice',
    description: 'Explains things clearly and helps with communication. Your translator.',
    capabilities: ['Clear Explanations', 'Report Writing', 'Summarization', 'Translation'],
  },
  Betelgeuse: {
    displayName: 'Betelgeuse - The Builder',
    type: 'hybrid',
    description: 'Launches and manages your services. Your IT specialist.',
    capabilities: ['Service Deployment', 'Website Hosting', 'Database Management', 'Monitoring'],
  },
}

export async function GET(request: NextRequest) {
  try {
    // Try to fetch real agent data from Supabase
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('*')
      .order('name')

    // Get session stats for each agent
    const { data: sessions, error: sessionsError } = await supabase
      .from('agent_sessions')
      .select('agent_id, status, started_at, completed_at, tokens_used')
      .order('started_at', { ascending: false })
      .limit(1000)

    if (agentsError || !agents || agents.length === 0) {
      // Return demo agent stats
      return NextResponse.json({
        success: true,
        agents: generateDemoAgentStats(),
        isDemo: true,
        timestamp: new Date().toISOString(),
      })
    }

    // Calculate stats from real data
    const agentStats: AgentStats[] = agents.map((agent: any) => {
      const agentSessions = sessions?.filter((s: any) => s.agent_id === agent.id) || []
      const completedSessions = agentSessions.filter((s: any) => s.status === 'completed')

      const successRate = agentSessions.length > 0
        ? Math.round((completedSessions.length / agentSessions.length) * 100)
        : 0

      const avgTime = completedSessions.length > 0
        ? calculateAvgResponseTime(completedSessions)
        : '0.0s'

      const config = AGENT_CONFIGS[agent.name as keyof typeof AGENT_CONFIGS] || {
        displayName: agent.display_name || agent.name,
        type: agent.type || 'hybrid',
        description: agent.description || 'AI assistant',
        capabilities: agent.capabilities || [],
      }

      return {
        id: agent.id,
        name: agent.name,
        displayName: config.displayName,
        type: config.type,
        status: mapAgentStatus(agent.status),
        description: config.description,
        capabilities: config.capabilities,
        stats: {
          tasksCompleted: completedSessions.length,
          successRate,
          avgResponseTime: avgTime,
          lastActive: agentSessions[0]?.started_at || agent.updated_at,
        },
        isDemo: false,
      }
    })

    return NextResponse.json({
      success: true,
      agents: agentStats,
      isDemo: false,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Agent Stats] Error:', error)

    return NextResponse.json({
      success: true,
      agents: generateDemoAgentStats(),
      isDemo: true,
      timestamp: new Date().toISOString(),
    })
  }
}

function mapAgentStatus(status: string): AgentStats['status'] {
  switch (status) {
    case 'active':
    case 'idle':
      return 'online'
    case 'busy':
      return 'busy'
    case 'error':
      return 'error'
    default:
      return 'offline'
  }
}

function calculateAvgResponseTime(sessions: any[]): string {
  const times = sessions
    .filter((s: any) => s.started_at && s.completed_at)
    .map((s: any) => {
      const start = new Date(s.started_at).getTime()
      const end = new Date(s.completed_at).getTime()
      return (end - start) / 1000
    })

  if (times.length === 0) return '0.0s'

  const avg = times.reduce((a, b) => a + b, 0) / times.length
  return `${avg.toFixed(1)}s`
}

function generateDemoAgentStats(): AgentStats[] {
  const statuses: AgentStats['status'][] = ['online', 'online', 'busy', 'online', 'online', 'online']

  return Object.entries(AGENT_CONFIGS).map(([name, config], index) => ({
    id: `demo-${index + 1}`,
    name,
    displayName: config.displayName,
    type: config.type,
    status: statuses[index],
    description: config.description,
    capabilities: config.capabilities,
    stats: {
      tasksCompleted: Math.floor(Math.random() * 200) + 100,
      successRate: Math.floor(Math.random() * 10) + 90,
      avgResponseTime: `${(Math.random() * 3 + 0.5).toFixed(1)}s`,
      lastActive: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    },
    isDemo: true,
  }))
}
