import tsEslint from 'typescript-eslint';

import { files } from '../utils/helpers.js';

/**
 * @param {import('eslint').Linter.Config | import('eslint').Linter.Config[]} preset
 * @returns {import('eslint').Linter.RulesRecord}
 */
const extractRules = preset => {
  const presets = Array.isArray(preset) ? preset : [preset];

  return presets.reduce(
    (rules, entry) => (entry?.rules ? { ...rules, ...entry.rules } : rules),
    /** @type {import('eslint').Linter.RulesRecord} */ ({}),
  );
};

const recommendedRules = {
  ...extractRules(tsEslint.configs.eslintRecommended),
  ...extractRules(tsEslint.configs.recommended),
  ...extractRules(tsEslint.configs.stylistic),
};

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    files: files.ts,
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        jsDocParsingMode: 'none',
        jsxPragma: null,
      },
    },
    plugins: {
      '@typescript-eslint': tsEslint.plugin,
    },
    rules: {
      ...recommendedRules,
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/class-literal-property-style': 'off',
      '@typescript-eslint/consistent-generic-constructors': 'off',
      'default-param-last': 'off',
      '@typescript-eslint/default-param-last': 'error',
      '@typescript-eslint/method-signature-style': ['error', 'property'],
      'dot-notation': 'off',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-useless-empty-export': 'error',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': 'allow-with-description' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          args: 'none',
        },
      ],
      '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
      // turn off eslint undef
      'no-undef': 'off',
    },
  },
];

export default config;
