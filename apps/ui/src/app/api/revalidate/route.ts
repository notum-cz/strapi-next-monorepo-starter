/**
 * ISR Webhook Route Handler
 * 
 * This API route listens to Strapi webhooks and triggers ISR revalidation
 * when games are created, updated, or deleted.
 * 
 * Route: POST /api/revalidate
 * 
 * How it works:
 * 1. When a game is updated/created/deleted in Strapi, it sends a webhook to this endpoint
 * 2. We verify the webhook secret for security
 * 3. We extract the game slug from the payload
 * 4. We call revalidatePath() to trigger ISR for that specific game page
 * 5. Next.js regenerates the page in the background
 */

import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

/**
 * Verify the webhook secret
 * This prevents unauthorized requests from triggering revalidation
 */
function verifyWebhookSecret(
  payload: string,
  signature: string | undefined
): boolean {
  if (!signature) {
    return false
  }

  const secret = process.env.STRAPI_WEBHOOK_SECRET

  if (!secret) {
    console.warn(
      "[ISR Webhook] STRAPI_WEBHOOK_SECRET is not set. Skipping verification."
    )
    return false
  }

  // For testing/development, you can skip verification by setting SKIP_WEBHOOK_VERIFY=true
  if (process.env.SKIP_WEBHOOK_VERIFY === "true") {
    return true
  }

  // In production, verify the signature
  // This is a simple comparison. In production, use proper HMAC-SHA256 verification
  return signature === secret
}

export async function POST(request: NextRequest) {
  try {
    // Get the webhook secret from headers
    const signature = request.headers.get("x-strapi-webhook-secret")

    // Read the request body
    const body = await request.json()
    const bodyString = JSON.stringify(body)

    // Verify the webhook signature
    if (!verifyWebhookSecret(bodyString, signature)) {
      console.warn("[ISR Webhook] Invalid webhook secret")
      return NextResponse.json(
        { error: "Invalid webhook secret" },
        { status: 401 }
      )
    }

    // Extract event type and game data
    const event = body.event
    const game = body.data

    if (!game || !game.slug) {
      console.warn("[ISR Webhook] No game slug found in webhook payload")
      return NextResponse.json(
        { error: "No game slug found" },
        { status: 400 }
      )
    }

    console.log(`[ISR Webhook] Event: ${event}, Game: ${game.slug}`)

    // Revalidate the game page for all locales
    // We revalidate both the game detail page and the games listing
    const locales = ["en", "cs", "fr", "de"] // Update with your actual locales

    for (const locale of locales) {
      // Revalidate individual game page
      revalidatePath(`/${locale}/games/${game.slug}`)
      console.log(
        `[ISR Webhook] Revalidated: /${locale}/games/${game.slug}`
      )

      // Revalidate games listing page
      revalidatePath(`/${locale}/games`)
      console.log(`[ISR Webhook] Revalidated: /${locale}/games`)
    }

    return NextResponse.json(
      {
        revalidated: true,
        message: `ISR revalidation triggered for game: ${game.slug}`,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[ISR Webhook] Error:", error)

    return NextResponse.json(
      {
        error: "Revalidation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * GET handler for testing
 * Returns webhook configuration information
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "ISR Webhook endpoint is active",
    endpoint: "/api/revalidate",
    method: "POST",
    documentation: {
      description:
        "This endpoint listens to Strapi webhooks and triggers ISR revalidation when games are updated",
      headers: {
        "x-strapi-webhook-secret": "Your webhook secret from Strapi",
      },
      payload: {
        event: "games.update|games.create|games.delete",
        data: {
          slug: "game-slug",
          id: 123,
        },
      },
    },
  })
}
