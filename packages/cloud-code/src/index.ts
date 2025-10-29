/**
 * @repo/cloud-code
 *
 * Optional cloud-code execution interface.
 * Stub-only implementation, non-blocking, tree-shakeable.
 *
 * When CLOUD_CODE_ENABLED=false (default), all operations return stubs.
 */

export {
  executeFunction,
  executeBatch,
  healthCheck,
  getCloudCodeInfo,
} from './client';

export { loadConfig, validateConfig, getConfig } from './config';

export type {
  ExecutionRequest,
  CloudCodeConfig,
  ExecutionResponse,
  StubResponse,
  ErrorResponse,
  CloudFunctionResult,
} from './types';

export { ExecutionRequestSchema } from './types';
