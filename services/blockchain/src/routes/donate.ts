import { Router } from 'express';
import { z } from 'zod';
import { logger } from '../config/logger';
import { prisma } from '../config/database';

const router = Router();

// Validation schema
const DonateSchema = z.object({
  walletAddress: z.string().length(44, 'Invalid Solana address'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['SOL', 'USDC']),
  projectId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  isAnonymous: z.boolean().optional().default(false)
});

/**
 * POST /donate
 * v0 Implementation: Mock blockchain donation
 *
 * In production, this will:
 * 1. Validate wallet signature
 * 2. Submit transaction to Solana via Helius RPC
 * 3. Poll for confirmation
 * 4. Queue NFT minting if amount >= $50
 *
 * For v0 E2E slice: Return mock transaction hash and store in DB
 */
router.post('/', async (req, res) => {
  try {
    // Validate request
    const data = DonateSchema.parse(req.body);

    logger.info('Processing donation', {
      walletAddress: data.walletAddress,
      amount: data.amount,
      currency: data.currency
    });

    // v0: Generate mock transaction hash
    const mockTxHash = `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store in database
    const donation = await prisma.donation.create({
      data: {
        walletAddress: data.walletAddress,
        amount: data.amount,
        currency: data.currency,
        transactionHash: mockTxHash,
        status: 'confirmed', // v0: instant confirmation
        projectId: data.projectId,
        userId: data.userId,
        isAnonymous: data.isAnonymous,
        usdValue: data.currency === 'SOL' ? data.amount * 100 : data.amount, // Mock SOL price
        blockNumber: 0, // Mock
        metadata: {}
      }
    });

    logger.info('Donation created', {
      donationId: donation.id,
      transactionHash: mockTxHash
    });

    // Response
    res.status(200).json({
      success: true,
      data: {
        donationId: donation.id,
        transactionHash: mockTxHash,
        status: 'confirmed',
        estimatedConfirmationTime: 0, // Mock: instant
        nftEligible: data.amount >= 50 // Threshold for NFT receipt
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error', { errors: error.errors });
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors
        }
      });
    }

    logger.error('Donation processing error', { error });
    res.status(500).json({
      success: false,
      error: {
        code: 'DONATION_FAILED',
        message: 'Failed to process donation'
      }
    });
  }
});

export default router;
