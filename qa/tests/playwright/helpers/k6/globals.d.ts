/**
 * Runtime globals k6 provides but @types/k6 doesn't declare. `lib: ["dom"]`
 * would declare them too, along with browser APIs k6 doesn't have.
 */
declare const console: {
  log: (...data: unknown[]) => void
  warn: (...data: unknown[]) => void
  error: (...data: unknown[]) => void
}

/** k6 resolves paths relative to the calling module through this. */
interface ImportMeta {
  resolve: (specifier: string) => string
}

/**
 * helpers/test-groups.ts is shared with the Node suites. The k6 scripts only
 * use its constants and assertKnown(); its functions that read `process` and
 * `URL` never run in k6. These declarations only let tsc check the file.
 */
declare const process: { env: Record<string, string | undefined> }
declare const URL: { parse: (url: string) => null | { hostname: string } }
