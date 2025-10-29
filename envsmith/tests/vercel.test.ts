import { describe, it, expect } from 'vitest';
import { envToVercelFormat } from '@/lib/vercel';

describe('vercel', () => {
  describe('envToVercelFormat', () => {
    it('should convert env content to Vercel format', () => {
      const envContent = `
DATABASE_URL=postgresql://localhost:5432/db
API_KEY=secret123
PORT=3000
      `.trim();

      const variables = envToVercelFormat(envContent);

      expect(variables).toHaveLength(3);
      expect(variables[0]).toMatchObject({
        key: 'DATABASE_URL',
        value: 'postgresql://localhost:5432/db',
        type: 'encrypted',
        target: ['development', 'preview', 'production'],
      });
    });

    it('should handle quoted values', () => {
      const envContent = `VAR1="quoted value"`;

      const variables = envToVercelFormat(envContent);

      expect(variables[0].value).toBe('quoted value');
    });

    it('should skip comments', () => {
      const envContent = `
# Comment
VAR=value
# Another comment
      `.trim();

      const variables = envToVercelFormat(envContent);

      expect(variables).toHaveLength(1);
      expect(variables[0].key).toBe('VAR');
    });

    it('should use custom targets', () => {
      const envContent = 'VAR=value';
      const variables = envToVercelFormat(envContent, ['development']);

      expect(variables[0].target).toEqual(['development']);
    });

    it('should handle empty input', () => {
      const variables = envToVercelFormat('');

      expect(variables).toHaveLength(0);
    });

    it('should handle multiple variables', () => {
      const envContent = `
VAR1=value1
VAR2=value2
VAR3=value3
      `.trim();

      const variables = envToVercelFormat(envContent);

      expect(variables).toHaveLength(3);
      expect(variables.map((v) => v.key)).toEqual(['VAR1', 'VAR2', 'VAR3']);
    });
  });
});
