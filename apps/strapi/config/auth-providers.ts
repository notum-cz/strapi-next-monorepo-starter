import jwt from "jsonwebtoken"
import AzureAdOAuth2Strategy from "passport-azure-ad-oauth2"

export function microsoftSSOProvider(
  env: (key: string, defaultValue?: string) => string | undefined
) {
  const clientID = env("MICROSOFT_CLIENT_ID")
  const clientSecret = env("MICROSOFT_CLIENT_SECRET")
  const tenant = env("MICROSOFT_TENANT_ID")

  if (!clientID || !clientSecret || !tenant) {
    console.warn("Microsoft SSO provider is not configured", {
      hasClientId: Boolean(clientID),
      hasClientSecret: Boolean(clientSecret),
      hasTenant: Boolean(tenant),
    })

    return null
  }

  return {
    uid: "azure_ad_oauth2",
    displayName: "Microsoft",
    icon: "/microsoft-logo.svg",
    createStrategy: (_strapi) => {
      return new AzureAdOAuth2Strategy(
        {
          clientID,
          clientSecret,
          scope: ["user:email"],
          tenant,
          callbackURL: `${env("APP_URL")}/admin/connect/azure_ad_oauth2`,
        },
        (accessToken, refreshToken, params, profile, done) => {
          const waadProfile = jwt.decode(params.id_token) as Record<
            string,
            string | undefined
          >

          const email =
            waadProfile.email ??
            waadProfile.upn ??
            waadProfile.preferred_username ??
            waadProfile.unique_name

          done(null, {
            email,
            username: email,
            firstname: waadProfile.given_name ?? "",
            lastname: waadProfile.family_name ?? "",
          })
        }
      )
    },
  }
}
