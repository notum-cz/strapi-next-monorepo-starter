/**
 * @repo/ai-router
 *
 * Optional LLM routing service with RouteLLM integration.
 *
 * When AI_ROUTER_ENABLED=false (default), all functions return stub responses.
 * This ensures the build never breaks due to missing router configuration.
 *
 * @example
 * ```typescript
 * import { routeChat } from '@repo/ai-router';
 *
 * const response = await routeChat([
 *   { role: 'user', content: 'Hello!' }
 * ]);
 *
 * if ('enabled' in response && !response.enabled) {
 *   console.log('Router disabled:', response.message);
 * } else {
 *   console.log('AI response:', response.choices[0].message.content);
 * }
 * ```
 */

export { routeChat, healthCheck, getRouterInfo } from './router';
export { loadConfig, validateConfig, getConfig } from './config';
export type {
  Message,
  RouterConfig,
  ChatOptions,
  ChatResponse,
  StubResponse,
} from './types';
