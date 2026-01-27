"use client"

import { useMutation } from "@tanstack/react-query"

import { authClient } from "@/lib/auth-client"

export function useUserMutations() {
  const signInMutation = useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const result = await authClient.signInStrapi({
        email: values.email,
        password: values.password,
      })

      return unwrapBetterAuth(result)
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const result = await authClient.registerStrapi({
        username: values.email,
        email: values.email,
        password: values.password,
      })

      return unwrapBetterAuth(result)
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: async (values: {
      currentPassword: string
      password: string
      passwordConfirmation: string
    }) => {
      const result = await authClient.updatePasswordStrapi({
        currentPassword: values.currentPassword,
        password: values.password,
        passwordConfirmation: values.passwordConfirmation,
      })

      return unwrapBetterAuth(result)
    },
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: async (values: { email: string }) => {
      const result = await authClient.forgotPasswordStrapi({
        email: values.email,
      })

      return unwrapBetterAuth(result)
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: async (values: {
      password: string
      passwordConfirmation: string
      code: string
    }) => {
      const result = await authClient.resetPasswordStrapi({
        password: values.password,
        passwordConfirmation: values.passwordConfirmation,
        code: values.code,
      })

      return unwrapBetterAuth(result)
    },
  })

  const syncOauthStrapiMutation = useMutation({
    mutationFn: async (values: { accessToken: string; provider: string }) => {
      const result = await authClient.syncOauthStrapi({
        accessToken: values.accessToken,
        provider: values.provider,
      })

      return unwrapBetterAuth(result)
    },
  })

  return {
    signInMutation,
    registerMutation,
    changePasswordMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
    syncOauthStrapiMutation,
  }
}

/**
 * Function that throws error if present, otherwise returns data.
 * This is suitable for use with react-query mutations.
 */
function unwrapBetterAuth<T>(result: {
  data: T | null
  error: unknown | null
}): T {
  if (result.error) {
    throw result.error
  }

  return result.data as T
}
