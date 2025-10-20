import { Router } from 'express';
import { z } from 'zod';
import { logger } from '../config/logger';
import { OpenRouterService } from '../services/openrouter-service';
import { supabase } from '../config/supabase';

const router = Router();
const openRouterService = new OpenRouterService();

// Validation schema
const ChatSchema = z.object({
  userId: z.string().uuid(),
  message: z.string().min(1).max(1000),
  conversationId: z.string().uuid().optional()
});

const AGENT_TYPES = ['nova-sign', 'echo-agent', 'flow-agent', 'pulse-agent'] as const;

/**
 * POST /agents/:agentType/chat
 * v0 Implementation: Mock AI responses
 *
 * In production, this will:
 * 1. Fetch user context (donations, projects)
 * 2. Call OpenRouter API with agent-specific prompt
 * 3. Store conversation in Supabase
 * 4. Track token usage and costs
 *
 * For v0 E2E slice: Return mock responses
 */
router.post('/:agentType/chat', async (req, res) => {
  try {
    const { agentType } = req.params;

    // Validate agent type
    if (!AGENT_TYPES.includes(agentType as any)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVALID_AGENT',
          message: `Agent type '${agentType}' not found`,
          validAgents: AGENT_TYPES
        }
      });
    }

    // Validate request
    const data = ChatSchema.parse(req.body);

    logger.info('Processing chat request', {
      agentType,
      userId: data.userId,
      messageLength: data.message.length
    });

    // v0: Mock responses
    const mockResponses: Record<string, string> = {
      'nova-sign': 'Hello! I\'m NovaSign, your Web3 educator. Blockchain donations work by creating a cryptographic transaction on the Solana network. This ensures transparency and immutability. Would you like to learn more about how wallet connections work?',
      'echo-agent': 'Greetings! I\'m EchoAgent, your wildlife conservation expert. The projects we support focus on habitat preservation, anti-poaching efforts, and species rehabilitation. Which wildlife cause are you most passionate about?',
      'flow-agent': 'Hi! I\'m FlowAgent, your donation advisor. I can help you maximize your impact through strategic giving. Did you know that donations above $50 receive an NFT receipt? Would you like to explore donation tiers?',
      'pulse-agent': 'Welcome! I\'m PulseAgent, tracking real-time impact. Based on current donations, we\'ve helped protect 1,247 hectares of wildlife habitat this month. Want to see your personal impact metrics?'
    };

    const response = mockResponses[agentType] || 'Hello! How can I help you today?';

    // v0: Skip Supabase storage for now
    // In production: await supabase.from('agent_conversations').insert(...)

    logger.info('Chat response generated', {
      agentType,
      userId: data.userId,
      responseLength: response.length
    });

    // Response
    res.status(200).json({
      success: true,
      data: {
        conversationId: data.conversationId || crypto.randomUUID(),
        agentType,
        message: response,
        timestamp: new Date().toISOString(),
        tokensUsed: 0 // Mock
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

    logger.error('Chat processing error', { error });
    res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_FAILED',
        message: 'Failed to process chat request'
      }
    });
  }
});

export default router;
