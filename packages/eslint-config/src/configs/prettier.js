import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export const prettierOptions = {
  singleQuote: false,
  semi: false,
  tabWidth: 2,
  useTabs: false,
  endOfLine: 'lf',
  trailingComma: 'es5',
  jsxSingleQuote: false,
  bracketSameLine: false,
  arrowParens: 'always',
  plugins: ['prettier-plugin-packagejson', 'prettier-plugin-tailwindcss'],
};

export default [
  eslintPluginPrettierRecommended,
  { rules: { 'prettier/prettier': ['error', prettierOptions] } },
];
