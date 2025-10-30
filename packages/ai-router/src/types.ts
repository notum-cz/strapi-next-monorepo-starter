import { z } from 'zod';

/**
 * Message schema for chat completions
 */
export const MessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant', 'function']),
  content: z.string(),
  name: z.string().optional(),
});

export type Message = z.infer<typeof MessageSchema>;

/**
 * Router configuration
 */
export interface RouterConfig {
  enabled: boolean;
  baseUrl: string;
  strongModel: string;
  weakModel: string;
  router: string;
  threshold?: number;
  timeout?: number;
}

/**
 * Chat completion options
 */
export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Chat completion response
 */
export interface ChatResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: Message;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Stub response when router is disabled
 */
export interface StubResponse {
  enabled: false;
  message: string;
  timestamp: string;
}
