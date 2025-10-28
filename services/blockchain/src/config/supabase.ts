import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  logger.warn('Supabase credentials not set - real-time donation feed will not be available');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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

  try {
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

    logger.info(`Published donation ${data.donationId} to real-time feed`);
    return true;
  } catch (error) {
    logger.error('Error publishing donation:', error);
    return null;
  }
}
