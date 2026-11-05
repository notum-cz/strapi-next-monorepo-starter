/**
 * k6 provides `console` at runtime, but @types/k6 doesn't declare it, and
 * `lib: ["dom"]` would also allow browser APIs k6 doesn't have.
 */
declare const console: {
  log: (...data: unknown[]) => void
  warn: (...data: unknown[]) => void
  error: (...data: unknown[]) => void
}
