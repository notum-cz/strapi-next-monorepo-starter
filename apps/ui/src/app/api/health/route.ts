export const dynamic = "force-dynamic"

// Health check endpoint. Returns a 200 status code if the server is running.
async function handler() {
  return Response.json(
    { data: "OK" },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  )
}

export { handler as GET }
