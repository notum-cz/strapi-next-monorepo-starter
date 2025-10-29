import type { RouterConfig } from './types';

/**
 * Load router configuration from environment variables
 *
 * @returns RouterConfig with default values
 */
export function loadConfig(): RouterConfig {
  return {
    enabled: process.env.AI_ROUTER_ENABLED === 'true',
    baseUrl: process.env.AI_ROUTER_BASE_URL || 'http://localhost:6060',
    strongModel: process.env.AI_STRONG_MODEL || 'gpt-4-1106-preview',
    weakModel: process.env.AI_WEAK_MODEL || 'anyscale/mistralai/Mixtral-8x7B-Instruct-v0.1',
    router: process.env.AI_ROUTER_TYPE || 'mf', // matrix-factorization router
    threshold: parseFloat(process.env.AI_ROUTER_THRESHOLD || '0.5'),
    timeout: parseInt(process.env.AI_ROUTER_TIMEOUT || '30000', 10),
  };
}

/**
 * Validate configuration
 *
 * @param config RouterConfig to validate
 * @returns true if valid, throws error otherwise
 */
export function validateConfig(config: RouterConfig): boolean {
  if (config.enabled) {
    if (!config.baseUrl) {
      throw new Error('AI_ROUTER_BASE_URL is required when AI_ROUTER_ENABLED=true');
    }
    if (!config.strongModel) {
      throw new Error('AI_STRONG_MODEL is required when AI_ROUTER_ENABLED=true');
    }
    if (!config.weakModel) {
      throw new Error('AI_WEAK_MODEL is required when AI_ROUTER_ENABLED=true');
    }
  }
  return true;
}

/**
 * Get default configuration with validation
 */
export function getConfig(): RouterConfig {
  const config = loadConfig();

  if (config.enabled) {
    validateConfig(config);
  }

  return config;
}
