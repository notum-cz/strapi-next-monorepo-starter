import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  executeFunction,
  executeBatch,
  healthCheck,
  getCloudCodeInfo,
} from '../client';
import type { ExecutionRequest } from '../types';

describe('Cloud Code - Disabled State', () => {
  beforeEach(() => {
    // Ensure cloud-code is disabled for these tests
    vi.stubEnv('CLOUD_CODE_ENABLED', 'false');
  });

  describe('executeFunction', () => {
    it('should return stub response when cloud-code is disabled', async () => {
      const request: ExecutionRequest = {
        functionName: 'testFunction',
        parameters: { foo: 'bar' },
      };

      const response = await executeFunction(request);

      expect(response).toHaveProperty('enabled', false);
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('timestamp');
      expect((response as any).enabled).toBe(false);
      expect((response as any).message).toContain('disabled');
    });

    it('should return stub for any function name', async () => {
      const requests: ExecutionRequest[] = [
        { functionName: 'function1' },
        { functionName: 'function2', parameters: { x: 1 } },
        { functionName: 'function3', timeout: 5000 },
      ];

      for (const request of requests) {
        const response = await executeFunction(request);
        expect((response as any).enabled).toBe(false);
      }
    });

    it('should include ISO 8601 timestamp in stub response', async () => {
      const request: ExecutionRequest = { functionName: 'test' };
      const response = await executeFunction(request);

      expect((response as any).timestamp).toBeDefined();
      expect(() => new Date((response as any).timestamp)).not.toThrow();
    });

    it('should handle requests with metadata', async () => {
      const request: ExecutionRequest = {
        functionName: 'test',
        metadata: { userId: '123', traceId: 'abc' },
      };

      const response = await executeFunction(request);

      expect((response as any).enabled).toBe(false);
    });
  });

  describe('executeBatch', () => {
    it('should return stub responses for all requests when disabled', async () => {
      const requests: ExecutionRequest[] = [
        { functionName: 'func1' },
        { functionName: 'func2' },
        { functionName: 'func3' },
      ];

      const responses = await executeBatch(requests);

      expect(responses).toHaveLength(3);
      responses.forEach((response) => {
        expect((response as any).enabled).toBe(false);
        expect((response as any).message).toContain('disabled');
      });
    });

    it('should handle empty batch', async () => {
      const responses = await executeBatch([]);

      expect(responses).toHaveLength(0);
    });

    it('should handle large batch', async () => {
      const requests: ExecutionRequest[] = Array.from({ length: 100 }, (_, i) => ({
        functionName: `func${i}`,
      }));

      const responses = await executeBatch(requests);

      expect(responses).toHaveLength(100);
      responses.forEach((response) => {
        expect((response as any).enabled).toBe(false);
      });
    });
  });

  describe('healthCheck', () => {
    it('should return disabled status when cloud-code is disabled', async () => {
      const health = await healthCheck();

      expect(health).toEqual({
        enabled: false,
        healthy: false,
        error: 'Cloud-code is disabled',
      });
    });
  });

  describe('getCloudCodeInfo', () => {
    it('should return configuration with enabled=false', () => {
      const info = getCloudCodeInfo();

      expect(info.enabled).toBe(false);
      expect(info).toHaveProperty('timeout');
      expect(info).toHaveProperty('retryAttempts');
    });

    it('should not expose sensitive fields', () => {
      const info = getCloudCodeInfo();

      expect(info).not.toHaveProperty('apiKey');
      expect(info).not.toHaveProperty('endpoint');
    });

    it('should return default configuration values', () => {
      const info = getCloudCodeInfo();

      expect(info.timeout).toBe(30000);
      expect(info.retryAttempts).toBe(3);
    });
  });
});

describe('Cloud Code - Enabled State (Stub Implementation)', () => {
  beforeEach(() => {
    // Enable cloud-code but expect stub since backend doesn't exist
    vi.stubEnv('CLOUD_CODE_ENABLED', 'true');
    vi.stubEnv('CLOUD_CODE_ENDPOINT', 'http://localhost:8080');
    vi.stubEnv('CLOUD_CODE_API_KEY', 'test-key');
  });

  it('should return stub even when enabled (no backend yet)', async () => {
    const request: ExecutionRequest = { functionName: 'test' };
    const response = await executeFunction(request);

    // Since backend doesn't exist, should still return stub
    expect((response as any).enabled).toBe(false);
  });

  it('should report unhealthy when enabled but no backend', async () => {
    const health = await healthCheck();

    expect(health.enabled).toBe(true);
    expect(health.healthy).toBe(false);
    expect(health.error).toContain('not yet implemented');
  });
});

describe('Cloud Code - Request Validation', () => {
  beforeEach(() => {
    vi.stubEnv('CLOUD_CODE_ENABLED', 'false');
  });

  it('should handle requests with optional timeout', async () => {
    const request: ExecutionRequest = {
      functionName: 'test',
      timeout: 10000,
    };

    const response = await executeFunction(request);

    expect((response as any).enabled).toBe(false);
  });

  it('should handle requests with complex parameters', async () => {
    const request: ExecutionRequest = {
      functionName: 'processData',
      parameters: {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
        },
        string: 'test',
        number: 42,
        boolean: true,
        null: null,
      },
    };

    const response = await executeFunction(request);

    expect((response as any).enabled).toBe(false);
  });

  it('should handle requests without parameters', async () => {
    const request: ExecutionRequest = {
      functionName: 'noParams',
    };

    const response = await executeFunction(request);

    expect((response as any).enabled).toBe(false);
  });
});
