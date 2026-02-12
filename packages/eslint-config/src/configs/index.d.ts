import type { Linter } from "eslint"

export type FlatConfigArray = Linter.Config[]

export const base: FlatConfigArray
export const javascript: FlatConfigArray
export const imprt: FlatConfigArray
export const next: FlatConfigArray
export const vitest: FlatConfigArray
export const prettier: FlatConfigArray
export const prettierOptions: import('prettier').Config
export const react: FlatConfigArray
export const typescript: FlatConfigArray
export const unusedImports: FlatConfigArray
export const typescriptTypeChecked: FlatConfigArray
export const sonarjs: FlatConfigArray
export const unicorn: FlatConfigArray
export const sortClassMembers: FlatConfigArray
export const turbo: FlatConfigArray
