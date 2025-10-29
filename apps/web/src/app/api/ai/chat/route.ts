import { NextRequest, NextResponse } from 'next/server';
import { routeChat, type Message } from '@repo/ai-router';
import { z } from 'zod';

/**
 * POST /api/ai/chat
 *
 * Chat completion endpoint with optional RouteLLM integration.
 *
 * When AI_ROUTER_ENABLED=false (default), returns a stub response.
 * When enabled, routes to appropriate LLM via RouteLLM.
 *
 * @example
 * ```bash
 * curl -X POST http://localhost:3000/api/ai/chat \
 *   -H "Content-Type: application/json" \
 *   -d '{"messages": [{"role": "user", "content": "Hello!"}]}'
 * ```
 */

const RequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant', 'function']),
      content: z.string(),
      name: z.string().optional(),
    })
  ),
  options: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().positive().optional(),
      model: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { messages, options } = RequestSchema.parse(body);

    // Call router (returns stub if disabled)
    const response = await routeChat(messages as Message[], options);

    // Check if router is disabled
    if ('enabled' in response && !response.enabled) {
      return NextResponse.json(
        {
          message: 'LLM router is currently disabled. Set AI_ROUTER_ENABLED=true to enable AI features.',
          details: response.message,
          timestamp: response.timestamp,
        },
        { status: 503 }
      );
    }

    // Return successful AI response
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request format',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error('[AI Chat API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/chat
 *
 * Returns API documentation and current router status.
 */
export async function GET() {
  const { getRouterInfo } = await import('@repo/ai-router');
  const info = getRouterInfo();

  return NextResponse.json(
    {
      endpoint: '/api/ai/chat',
      methods: ['POST'],
      status: info.enabled ? 'enabled' : 'disabled',
      config: info,
      documentation: {
        description: 'Chat completion endpoint with RouteLLM integration',
        example: {
          method: 'POST',
          body: {
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: 'What is 2+2?' },
            ],
            options: {
              temperature: 0.7,
              maxTokens: 500,
            },
          },
        },
      },
    },
    { status: 200 }
  );
}
