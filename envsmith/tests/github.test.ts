import { describe, it, expect } from 'vitest';
import { encryptSecret } from '@/lib/github';

describe('github', () => {
  describe('encryptSecret', () => {
    it('should encrypt a secret value', async () => {
      // Mock public key (base64)
      const publicKey = 'dGVzdC1wdWJsaWMta2V5LWZvci10ZXN0aW5nLXB1cnBvc2VzLW9ubHk=';
      const secretValue = 'my-secret-value';

      const encrypted = await encryptSecret(publicKey, secretValue);

      // Should return a base64 string
      expect(encrypted).toBeTruthy();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);

      // Should be valid base64
      expect(() => Buffer.from(encrypted, 'base64')).not.toThrow();
    });

    it('should produce different outputs for different inputs', async () => {
      const publicKey = 'dGVzdC1wdWJsaWMta2V5LWZvci10ZXN0aW5nLXB1cnBvc2VzLW9ubHk=';
      const secret1 = 'secret1';
      const secret2 = 'secret2';

      const encrypted1 = await encryptSecret(publicKey, secret1);
      const encrypted2 = await encryptSecret(publicKey, secret2);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty secrets', async () => {
      const publicKey = 'dGVzdC1wdWJsaWMta2V5LWZvci10ZXN0aW5nLXB1cnBvc2VzLW9ubHk=';
      const secretValue = '';

      const encrypted = await encryptSecret(publicKey, secretValue);

      expect(encrypted).toBeTruthy();
      expect(typeof encrypted).toBe('string');
    });
  });
});
