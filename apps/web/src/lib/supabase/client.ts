import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const auth = {
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  },

  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthChange: (callback: (user: any) => void) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null);
    });
  }
};

// Database helpers
export const db = {
  // AI Conversations
  saveConversation: async (data: {
    userId: string;
    agentType: string;
    message: string;
    response: string;
    tokensUsed: number;
  }) => {
    return await supabase.from('ai_conversations').insert({
      user_id: data.userId,
      agent_type: data.agentType,
      message: data.message,
      response: data.response,
      tokens_used: data.tokensUsed
    });
  },

  // Donations Feed (real-time)
  subscribeToDonations: (callback: (donation: any) => void) => {
    return supabase
      .channel('donations_feed')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'donations_feed'
      }, (payload) => {
        callback(payload.new);
      })
      .subscribe();
  },

  // User Perks
  getUserPerks: async (userId: string) => {
    return await supabase
      .from('user_perks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  }
};

// ============================================================================
// STELLAR COCKPIT TYPES
// ============================================================================

export interface Agent {
  id: string;
  name: string;
  display_name: string;
  type: 'voice' | 'coding' | 'browsing' | 'orchestrator' | 'hybrid';
  description?: string;
  capabilities?: string[];
  model_config?: any;
  status: 'idle' | 'active' | 'busy' | 'error' | 'offline';
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface AgentSession {
  id: string;
  agent_id: string;
  user_id?: string;
  session_type: string;
  input_data?: any;
  output_data?: any;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  tokens_used: number;
  cost_usd: number;
  error_message?: string;
  metadata?: any;
}

export interface AgentLog {
  id: string;
  session_id: string;
  agent_id: string;
  log_level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  message: string;
  tool_call?: string;
  thought_process?: string;
  screenshot_url?: string;
  metadata?: any;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  display_name: string;
  type: string;
  description?: string;
  endpoint_url?: string;
  health_check_url?: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown' | 'offline';
  last_health_check?: string;
  version?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// STELLAR COCKPIT DATABASE HELPERS
// ============================================================================

export const stellarCockpit = {
  // Agents
  getAgents: async () => {
    return await supabase
      .from('agents')
      .select('*')
      .order('name');
  },

  getAgent: async (name: string) => {
    return await supabase
      .from('agents')
      .select('*')
      .eq('name', name)
      .single();
  },

  // Sessions
  getRecentSessions: async (agentId: string, limit: number = 10) => {
    return await supabase
      .from('agent_sessions')
      .select('*')
      .eq('agent_id', agentId)
      .order('started_at', { ascending: false })
      .limit(limit);
  },

  // Logs
  getLogs: async (sessionId: string) => {
    return await supabase
      .from('agent_logs')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
  },

  subscribeToLogs: (callback: (log: AgentLog) => void) => {
    return supabase
      .channel('agent_logs')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'agent_logs'
      }, (payload) => {
        callback(payload.new as AgentLog);
      })
      .subscribe();
  },

  // Services
  getServices: async () => {
    return await supabase
      .from('services')
      .select('*')
      .order('name');
  },
};

export default supabase;
