import {
  base,
  imprt,
  javascript,
  prettier,
  react,
  sonarjs,
  next,
  turbo,
  typescript,
  unicorn,
  unusedImports,
} from './src/configs/index.js';

export default [
  ...base,
  ...javascript,
  ...typescript,
  ...react,
  ...next,
  ...turbo,
  ...imprt,
  ...sonarjs,
  ...unicorn,
  ...unusedImports,
  ...prettier,
];
