/**
 * k6 provides `console` at runtime, but @types/k6 doesn't declare it, and
 * `lib: ["dom"]` would also allow browser APIs k6 doesn't have.
 */
declare const console: {
  log: (...data: unknown[]) => void
  warn: (...data: unknown[]) => void
  error: (...data: unknown[]) => void
}

/**
 * helpers/test-groups.ts is shared with the Node suites. The load test only
 * uses its constants and assertKnown(); its functions that read `process`
 * and `URL` never run in k6. These declarations only let tsc check the file.
 */
declare const process: { env: Record<string, string | undefined> }
declare const URL: { parse: (url: string) => null | { hostname: string } }
