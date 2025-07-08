"use client"

import { useMutation } from "@tanstack/react-query"

import { PublicStrapiClient } from "@/lib/strapi-api"

export function useContactForm() {
  return useMutation({
    mutationFn: (values: { name: string; email: string; message: string }) => {
      const path = PublicStrapiClient.getStrapiApiPathByUId(
        "api::subscriber.subscriber"
      )

      return PublicStrapiClient.fetchAPI(
        path,
        undefined,
        {
          method: "POST",
          body: JSON.stringify({ data: values }),
        },
        { useProxy: true }
      )
    },
  })
}
