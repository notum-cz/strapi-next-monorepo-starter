import type { CloudCodeConfig } from './types';

/**
 * Load cloud-code configuration from environment variables
 *
 * @returns CloudCodeConfig with default values
 */
export function loadConfig(): CloudCodeConfig {
  return {
    enabled: process.env.CLOUD_CODE_ENABLED === 'true',
    endpoint: process.env.CLOUD_CODE_ENDPOINT,
    apiKey: process.env.CLOUD_CODE_API_KEY,
    timeout: parseInt(process.env.CLOUD_CODE_TIMEOUT || '30000', 10),
    retryAttempts: parseInt(process.env.CLOUD_CODE_RETRY_ATTEMPTS || '3', 10),
  };
}

/**
 * Validate configuration
 *
 * @param config CloudCodeConfig to validate
 * @returns true if valid, throws error otherwise
 */
export function validateConfig(config: CloudCodeConfig): boolean {
  if (config.enabled) {
    if (!config.endpoint) {
      throw new Error('CLOUD_CODE_ENDPOINT is required when CLOUD_CODE_ENABLED=true');
    }
    if (!config.apiKey) {
      throw new Error('CLOUD_CODE_API_KEY is required when CLOUD_CODE_ENABLED=true');
    }
  }
  return true;
}

/**
 * Get default configuration with validation
 */
export function getConfig(): CloudCodeConfig {
  const config = loadConfig();

  if (config.enabled) {
    validateConfig(config);
  }

  return config;
}
