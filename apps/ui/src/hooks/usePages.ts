"use client"

import { useQuery } from "@tanstack/react-query"
import { useLocale } from "next-intl"

import { AppLocale } from "@/types/general"

import { PublicStrapiClient } from "@/lib/strapi-api"

export function useAllPages() {
  const locale = useLocale() as AppLocale

  return useQuery({
    queryKey: ["pages", locale],
    queryFn: async () =>
      PublicStrapiClient.fetchAll(
        "api::page.page",
        {
          locale,
          status: "published",
        },
        undefined,
        // This is a client-side query, so we use the proxy to transform the request
        // to the Strapi API URL
        { useProxy: true }
      ),
  })
}
