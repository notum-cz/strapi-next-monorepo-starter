import { describe, it, expect, vi, beforeEach } from 'vitest';
import { routeChat, healthCheck, getRouterInfo } from '../router';
import type { Message } from '../types';

describe('AI Router - Disabled State', () => {
  beforeEach(() => {
    // Ensure router is disabled for these tests
    vi.stubEnv('AI_ROUTER_ENABLED', 'false');
  });

  describe('routeChat', () => {
    it('should return stub response when router is disabled', async () => {
      const messages: Message[] = [
        { role: 'user', content: 'Hello, world!' },
      ];

      const response = await routeChat(messages);

      expect(response).toHaveProperty('enabled', false);
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('timestamp');
      expect((response as any).enabled).toBe(false);
      expect((response as any).message).toContain('disabled');
    });

    it('should return stub response with custom options', async () => {
      const messages: Message[] = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'What is 2+2?' },
      ];

      const response = await routeChat(messages, {
        temperature: 0.9,
        maxTokens: 100,
      });

      expect(response).toHaveProperty('enabled', false);
      expect((response as any).enabled).toBe(false);
    });

    it('should include ISO 8601 timestamp in stub response', async () => {
      const messages: Message[] = [{ role: 'user', content: 'Test' }];
      const response = await routeChat(messages);

      expect((response as any).timestamp).toBeDefined();
      expect(() => new Date((response as any).timestamp)).not.toThrow();
    });
  });

  describe('healthCheck', () => {
    it('should return disabled status when router is disabled', async () => {
      const health = await healthCheck();

      expect(health).toEqual({
        enabled: false,
        healthy: false,
        error: 'Router is disabled',
      });
    });
  });

  describe('getRouterInfo', () => {
    it('should return configuration with enabled=false', () => {
      const info = getRouterInfo();

      expect(info.enabled).toBe(false);
      expect(info).toHaveProperty('strongModel');
      expect(info).toHaveProperty('weakModel');
      expect(info).toHaveProperty('router');
      expect(info).toHaveProperty('threshold');
      expect(info).toHaveProperty('timeout');
    });

    it('should not expose baseUrl for security', () => {
      const info = getRouterInfo();

      expect(info).not.toHaveProperty('baseUrl');
    });

    it('should return default configuration values', () => {
      const info = getRouterInfo();

      expect(info.strongModel).toBe('gpt-4-1106-preview');
      expect(info.weakModel).toBe('anyscale/mistralai/Mixtral-8x7B-Instruct-v0.1');
      expect(info.router).toBe('mf');
      expect(info.threshold).toBe(0.5);
      expect(info.timeout).toBe(30000);
    });
  });
});

describe('AI Router - Error Handling', () => {
  beforeEach(() => {
    // Enable router but simulate network error
    vi.stubEnv('AI_ROUTER_ENABLED', 'true');
    vi.stubEnv('AI_ROUTER_BASE_URL', 'http://localhost:9999');
  });

  it('should return stub response on network error', async () => {
    const messages: Message[] = [{ role: 'user', content: 'Test' }];

    // This should fail to connect and return stub
    const response = await routeChat(messages);

    expect(response).toHaveProperty('enabled', false);
    expect(response).toHaveProperty('message');
    expect((response as any).message).toContain('error');
  });

  it('should return stub response on timeout', async () => {
    vi.stubEnv('AI_ROUTER_TIMEOUT', '1'); // 1ms timeout

    const messages: Message[] = [{ role: 'user', content: 'Test' }];
    const response = await routeChat(messages);

    expect(response).toHaveProperty('enabled', false);
  });
});

describe('AI Router - Message Validation', () => {
  beforeEach(() => {
    vi.stubEnv('AI_ROUTER_ENABLED', 'false');
  });

  it('should handle messages with optional name field', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'Hello', name: 'TestUser' },
    ];

    const response = await routeChat(messages);

    expect(response).toHaveProperty('enabled', false);
  });

  it('should handle function role messages', async () => {
    const messages: Message[] = [
      { role: 'function', content: '{"result": "success"}', name: 'my_function' },
    ];

    const response = await routeChat(messages);

    expect(response).toHaveProperty('enabled', false);
  });

  it('should handle multi-turn conversations', async () => {
    const messages: Message[] = [
      { role: 'system', content: 'You are helpful.' },
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Hello!' },
      { role: 'user', content: 'How are you?' },
    ];

    const response = await routeChat(messages);

    expect(response).toHaveProperty('enabled', false);
  });
});
