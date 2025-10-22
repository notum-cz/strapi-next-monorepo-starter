// ============================================================================
// SUPABASE CLIENT CONFIGURATION
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import type { Agent, AgentSession, AgentLog } from '../types';

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
}

// ============================================================================
// SUPABASE CLIENT (Service Role - Full Access)
// ============================================================================

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fetch an agent by name
 */
export async function getAgent(name: string): Promise<Agent | null> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('name', name)
    .single();

  if (error) {
    console.error(`Error fetching agent ${name}:`, error);
    return null;
  }

  return data;
}

/**
 * Update agent status
 */
export async function updateAgentStatus(
  agentId: string,
  status: 'idle' | 'active' | 'busy' | 'error' | 'offline'
): Promise<void> {
  const { error } = await supabase
    .from('agents')
    .update({ status })
    .eq('id', agentId);

  if (error) {
    console.error(`Error updating agent ${agentId} status:`, error);
  }
}

/**
 * Create a new agent session
 */
export async function createSession(data: {
  agent_id: string;
  user_id?: string;
  session_type: string;
  input_data?: any;
}): Promise<string> {
  const { data: session, error } = await supabase
    .from('agent_sessions')
    .insert({
      ...data,
      status: 'running',
      started_at: new Date().toISOString(),
      tokens_used: 0,
      cost_usd: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    throw new Error('Failed to create session');
  }

  return session.id;
}

/**
 * Complete an agent session
 */
export async function completeSession(
  sessionId: string,
  data: {
    output_data?: any;
    tokens_used?: number;
    cost_usd?: number;
    status?: 'completed' | 'failed' | 'cancelled';
    error_message?: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from('agent_sessions')
    .update({
      ...data,
      completed_at: new Date().toISOString(),
      status: data.status || 'completed',
    })
    .eq('id', sessionId);

  if (error) {
    console.error(`Error completing session ${sessionId}:`, error);
  }
}

/**
 * Log an agent action
 */
export async function logAction(data: {
  session_id: string;
  agent_id: string;
  log_level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  message: string;
  tool_call?: string;
  thought_process?: string;
  screenshot_url?: string;
  metadata?: any;
}): Promise<void> {
  const { error } = await supabase.from('agent_logs').insert({
    ...data,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error logging action:', error);
  }
}

/**
 * Fetch recent sessions for an agent
 */
export async function getRecentSessions(
  agentId: string,
  limit: number = 10
): Promise<AgentSession[]> {
  const { data, error } = await supabase
    .from('agent_sessions')
    .select('*')
    .eq('agent_id', agentId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`Error fetching sessions for agent ${agentId}:`, error);
    return [];
  }

  return data || [];
}

/**
 * Fetch logs for a session
 */
export async function getSessionLogs(sessionId: string): Promise<AgentLog[]> {
  const { data, error } = await supabase
    .from('agent_logs')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(`Error fetching logs for session ${sessionId}:`, error);
    return [];
  }

  return data || [];
}

/**
 * Stream real-time logs
 */
export function subscribeToLogs(
  callback: (log: AgentLog) => void,
  agentId?: string
) {
  let query = supabase
    .channel('agent_logs')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_logs' }, (payload) => {
      const log = payload.new as AgentLog;
      if (!agentId || log.agent_id === agentId) {
        callback(log);
      }
    });

  query.subscribe();

  return () => {
    query.unsubscribe();
  };
}

/**
 * Calculate token cost (rough estimates)
 */
export function calculateCost(provider: string, model: string, tokens: number): number {
  const costs: Record<string, number> = {
    'gpt-4-turbo': 0.01 / 1000, // $0.01 per 1K tokens (average)
    'gpt-4o-realtime-preview': 0.06 / 1000, // $0.06 per 1K tokens
    'claude-3-5-sonnet-20241022': 0.003 / 1000, // $0.003 per 1K tokens
    'gemini-2.0-flash-exp': 0.0001 / 1000, // Free during preview
  };

  const costPerToken = costs[model] || 0.001 / 1000; // Default fallback
  return tokens * costPerToken;
}
