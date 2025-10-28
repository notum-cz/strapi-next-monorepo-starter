import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  logger.warn('Supabase credentials not set - conversation history will not be stored');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper to save chat conversation
export async function saveChatConversation(data: {
  userId: string;
  agentType: string;
  message: string;
  response: string;
  tokensUsed: number;
}) {
  if (!supabaseUrl || !supabaseKey) {
    logger.warn('Supabase not configured - skipping chat save');
    return null;
  }

  const { data: conversation, error } = await supabase
    .from('ai_conversations')
    .insert({
      user_id: data.userId,
      agent_type: data.agentType,
      message: data.message,
      response: data.response,
      tokens_used: data.tokensUsed,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    logger.error('Failed to save conversation:', error);
    return null;
  }

  return conversation?.id;
}

// Helper to publish donation event to real-time feed
export async function publishDonationEvent(data: {
  donationId: string;
  walletAddress: string;
  amount: number;
  currency: string;
  usdValue: number;
}) {
  if (!supabaseUrl || !supabaseKey) {
    logger.warn('Supabase not configured - skipping donation publish');
    return null;
  }

  const { error } = await supabase
    .from('donations_feed')
    .insert({
      donation_id: data.donationId,
      wallet_address: data.walletAddress,
      amount: data.amount,
      currency: data.currency,
      usd_value: data.usdValue,
      created_at: new Date().toISOString(),
    });

  if (error) {
    logger.error('Failed to publish donation:', error);
    return null;
  }

  return true;
}
