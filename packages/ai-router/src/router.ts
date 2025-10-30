import type { Message, ChatOptions, ChatResponse, StubResponse, RouterConfig } from './types';
import { getConfig } from './config';

/**
 * Route chat completion request to appropriate LLM
 *
 * When AI_ROUTER_ENABLED=false, returns a stub response.
 * When enabled, calls RouteLLM OpenAI-compatible server.
 *
 * @param messages - Array of chat messages
 * @param options - Optional chat completion options
 * @returns Chat completion response or stub
 */
export async function routeChat(
  messages: Message[],
  options: ChatOptions = {}
): Promise<ChatResponse | StubResponse> {
  const config = getConfig();

  // Return stub if router is disabled
  if (!config.enabled) {
    return {
      enabled: false,
      message: 'LLM router is disabled. Set AI_ROUTER_ENABLED=true to enable.',
      timestamp: new Date().toISOString(),
    };
  }

  // Call RouteLLM OpenAI-compatible endpoint
  try {
    const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || config.strongModel,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
        stream: options.stream ?? false,
        metadata: {
          ...options.metadata,
          router: config.router,
          threshold: config.threshold,
        },
      }),
      signal: AbortSignal.timeout(config.timeout),
    });

    if (!response.ok) {
      throw new Error(`RouteLLM server error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as ChatResponse;
  } catch (error) {
    // Log error but don't throw - return error as stub
    console.error('[AI Router] Error calling RouteLLM:', error);

    return {
      enabled: false,
      message: `LLM router error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Check if router is enabled and healthy
 *
 * @returns Object with status and optional error
 */
export async function healthCheck(): Promise<{
  enabled: boolean;
  healthy: boolean;
  error?: string;
}> {
  const config = getConfig();

  if (!config.enabled) {
    return {
      enabled: false,
      healthy: false,
      error: 'Router is disabled',
    };
  }

  try {
    const response = await fetch(`${config.baseUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    return {
      enabled: true,
      healthy: response.ok,
      error: response.ok ? undefined : `Server returned ${response.status}`,
    };
  } catch (error) {
    return {
      enabled: true,
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get current router configuration (safe to expose)
 *
 * @returns Sanitized configuration object
 */
export function getRouterInfo(): Omit<RouterConfig, 'baseUrl'> {
  const config = getConfig();

  return {
    enabled: config.enabled,
    strongModel: config.strongModel,
    weakModel: config.weakModel,
    router: config.router,
    threshold: config.threshold,
    timeout: config.timeout,
    // baseUrl omitted for security
  } as Omit<RouterConfig, 'baseUrl'>;
}
