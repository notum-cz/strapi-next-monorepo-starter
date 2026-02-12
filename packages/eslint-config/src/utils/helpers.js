/**
 * File extensions for specific file types.
 */
export const files = {
  ts: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
  js: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
  jsx: ['**/*.tsx', '**/*.jsx'],
  test: [
    '**/*.test.*',
    '**/*_test.*',
    '**/*Test.*',
    '**/*.spec.*',
    '**/*_spec.*',
    '**/*Spec.*',
    '**/__tests__/**/*',
    '**/__integration__/**/*',
    '**/__regression__/**/*',
    '**/__mocks__/**/*',
  ],
};
