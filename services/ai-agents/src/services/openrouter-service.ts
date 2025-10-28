import axios from 'axios';
import { logger } from '../config/logger';

export class OpenRouterService {
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('OPENROUTER_API_KEY not set - AI features will not work');
    }
  }

  /**
   * Send chat completion request to OpenRouter
   * v0: Placeholder implementation
   */
  async chat(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    maxTokens?: number;
  }) {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: params.model,
          messages: params.messages,
          max_tokens: params.maxTokens || 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        content: response.data.choices[0].message.content,
        tokensUsed: response.data.usage.total_tokens,
        model: response.data.model
      };
    } catch (error: any) {
      logger.error('OpenRouter API error', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error('Failed to get AI response');
    }
  }
}
