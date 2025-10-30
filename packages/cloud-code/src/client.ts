import type {
  ExecutionRequest,
  CloudFunctionResult,
  StubResponse,
  ExecutionResponse,
  ErrorResponse,
} from './types';
import { getConfig } from './config';

/**
 * Execute a cloud function
 *
 * When CLOUD_CODE_ENABLED=false (default), returns a stub response.
 * When enabled, would call the cloud-code execution service.
 *
 * @param request - Function execution request
 * @returns Execution result or stub
 */
export async function executeFunction(
  request: ExecutionRequest
): Promise<CloudFunctionResult> {
  const config = getConfig();

  // Return stub if cloud-code is disabled
  if (!config.enabled) {
    return createStubResponse();
  }

  // In a real implementation, this would call the cloud-code service
  // For now, return stub even when "enabled" since no backend exists yet
  try {
    // Placeholder for future implementation:
    // const response = await fetch(`${config.endpoint}/execute`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${config.apiKey}`,
    //   },
    //   body: JSON.stringify(request),
    //   signal: AbortSignal.timeout(config.timeout!),
    // });
    //
    // if (!response.ok) {
    //   throw new Error(`Cloud-code error: ${response.status}`);
    // }
    //
    // return await response.json() as ExecutionResponse;

    // For now, return stub
    return createStubResponse();
  } catch (error) {
    console.error('[Cloud Code] Error:', error);
    return createErrorResponse(error);
  }
}

/**
 * Batch execute multiple cloud functions
 *
 * @param requests - Array of execution requests
 * @returns Array of execution results
 */
export async function executeBatch(
  requests: ExecutionRequest[]
): Promise<CloudFunctionResult[]> {
  const config = getConfig();

  if (!config.enabled) {
    return requests.map(() => createStubResponse());
  }

  // Execute all requests in parallel
  return Promise.all(requests.map((req) => executeFunction(req)));
}

/**
 * Check if cloud-code service is enabled and healthy
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
      error: 'Cloud-code is disabled',
    };
  }

  // Placeholder for future health check implementation
  // try {
  //   const response = await fetch(`${config.endpoint}/health`, {
  //     method: 'GET',
  //     signal: AbortSignal.timeout(5000),
  //   });
  //
  //   return {
  //     enabled: true,
  //     healthy: response.ok,
  //     error: response.ok ? undefined : `Server returned ${response.status}`,
  //   };
  // } catch (error) {
  //   return {
  //     enabled: true,
  //     healthy: false,
  //     error: error instanceof Error ? error.message : 'Unknown error',
  //   };
  // }

  return {
    enabled: true,
    healthy: false,
    error: 'Cloud-code service not yet implemented',
  };
}

/**
 * Get current cloud-code configuration (safe to expose)
 *
 * @returns Sanitized configuration object
 */
export function getCloudCodeInfo(): Omit<
  ReturnType<typeof getConfig>,
  'apiKey' | 'endpoint'
> {
  const config = getConfig();

  return {
    enabled: config.enabled,
    timeout: config.timeout,
    retryAttempts: config.retryAttempts,
    // apiKey and endpoint omitted for security
  };
}

/**
 * Create a stub response
 */
function createStubResponse(): StubResponse {
  return {
    enabled: false,
    message: 'Cloud-code is disabled. Set CLOUD_CODE_ENABLED=true to enable.',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create an error response
 */
function createErrorResponse(error: unknown): ErrorResponse {
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error',
    code: 'EXECUTION_ERROR',
    timestamp: new Date().toISOString(),
  };
}
