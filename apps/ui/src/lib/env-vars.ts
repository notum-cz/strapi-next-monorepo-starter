import { env } from "@/env.mjs"

/**
 * Use this function to get environment variables safely both in server and client contexts.
 * This is wrapper around the `env` object from `env.mjs` and provides additional
 * functionality for client-side access.
 */
export const getEnvVar = <K extends keyof typeof env>(
  varName: K,
  throwIfMissing = false
): (typeof env)[K] => {
  try {
    // @/env.mjs validates server vs client access and throws if there is a violation
    const value = env[varName]

    // check if the value is undefined or empty and throw
    if (!value || value === "") {
      throw new Error(
        `Environment variable ${varName} is not defined or is empty.`
      )
    }

    return value
  } catch (e: unknown) {
    // try to get the variable from global CSR_CONFIG object on the client side
    // @ts-expect-error - CSR_CONFIG is dynamically injected
    if (globalThis.window !== undefined && globalThis.CSR_CONFIG?.[varName]) {
      // @ts-expect-error - CSR_CONFIG
      return globalThis.CSR_CONFIG?.[varName]
    }

    if (throwIfMissing) {
      throw e
    }
  }
}
