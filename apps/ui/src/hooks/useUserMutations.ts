"use client"

import { useMutation } from "@tanstack/react-query"

import { authClient } from "@/lib/auth-client"

export function useUserMutations() {
  const signInMutation = useMutation({
    mutationFn: (values: { email: string; password: string }) =>
      authClient.signInStrapi({
        email: values.email,
        password: values.password,
      }),
  })

  const registerMutation = useMutation({
    mutationFn: (values: { email: string; password: string }) =>
      authClient.registerStrapi({
        username: values.email,
        email: values.email,
        password: values.password,
      }),
  })

  const changePasswordMutation = useMutation({
    mutationFn: (values: {
      currentPassword: string
      password: string
      passwordConfirmation: string
    }) =>
      authClient.updatePassword({
        currentPassword: values.currentPassword,
        password: values.password,
        passwordConfirmation: values.passwordConfirmation,
      }),
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: (values: { email: string }) =>
      authClient.forgotPasswordStrapi({
        email: values.email,
      }),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (values: {
      password: string
      passwordConfirmation: string
      code: string
    }) =>
      authClient.resetPasswordStrapi({
        password: values.password,
        passwordConfirmation: values.passwordConfirmation,
        code: values.code,
      }),
  })

  const signOutMutation = useMutation({
    mutationFn: () => authClient.signOut(),
  })

  const syncOauthStrapiMutation = useMutation({
    mutationFn: (values: { accessToken: string; provider: string }) =>
      authClient.syncOauthStrapi({
        accessToken: values.accessToken,
        provider: values.provider,
      }),
  })

  return {
    signInMutation,
    registerMutation,
    changePasswordMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
    signOutMutation,
    syncOauthStrapiMutation,
  }
}
