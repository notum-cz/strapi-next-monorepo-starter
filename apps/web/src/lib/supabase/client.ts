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

export default supabase;
