import { z } from 'zod';

/**
 * Cloud code execution request schema
 */
export const ExecutionRequestSchema = z.object({
  functionName: z.string().min(1),
  parameters: z.record(z.any()).optional(),
  timeout: z.number().positive().optional(),
  metadata: z.record(z.any()).optional(),
});

export type ExecutionRequest = z.infer<typeof ExecutionRequestSchema>;

/**
 * Cloud code configuration
 */
export interface CloudCodeConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  timeout?: number;
  retryAttempts?: number;
}

/**
 * Successful execution response
 */
export interface ExecutionResponse {
  success: true;
  result: any;
  executionId: string;
  executionTime: number;
  timestamp: string;
}

/**
 * Stub response when cloud-code is disabled
 */
export interface StubResponse {
  enabled: false;
  message: string;
  timestamp: string;
}

/**
 * Error response
 */
export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  timestamp: string;
}

/**
 * Cloud function result type
 */
export type CloudFunctionResult = ExecutionResponse | StubResponse | ErrorResponse;
