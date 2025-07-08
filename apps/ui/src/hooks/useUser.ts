"use client"

import { useMutation } from "@tanstack/react-query"

import { PrivateStrapiClient, PublicStrapiClient } from "@/lib/strapi-api"

export function useUserMutations() {
  const registerMutation = useMutation({
    mutationFn: (values: {
      username: string
      email: string
      password: string
    }) =>
      PrivateStrapiClient.fetchAPI(
        `/auth/local/register`,
        undefined,
        {
          body: JSON.stringify(values),
          method: "POST",
        },
        { omitUserAuthorization: true, useProxy: true }
      ),
  })

  const changePasswordMutation = useMutation({
    mutationFn: (values: {
      currentPassword: string
      password: string
      passwordConfirmation: string
    }) => {
      return PrivateStrapiClient.fetchAPI(
        `/auth/change-password`,
        undefined,
        {
          body: JSON.stringify(values),
          method: "POST",
        },
        { useProxy: true }
      )
    },
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: (values: { email: string }) => {
      return PrivateStrapiClient.fetchAPI(
        `/auth/forgot-password`,
        undefined,
        {
          body: JSON.stringify(values),
          method: "POST",
        },
        { omitUserAuthorization: true, useProxy: true }
      )
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (values: {
      password: string
      passwordConfirmation: string
      code: string
    }) => {
      return PublicStrapiClient.fetchAPI(
        `/auth/reset-password`,
        undefined,
        {
          body: JSON.stringify(values),
          method: "POST",
        },
        { useProxy: true }
      )
    },
  })

  return {
    registerMutation,
    changePasswordMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
  }
}
