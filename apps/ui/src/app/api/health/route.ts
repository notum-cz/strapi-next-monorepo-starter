// Health check endpoint. Return a 200 status code if the server is running.
async function handler() {
  return Response.json({ data: "OK" }, { status: 200 })
}

export { handler as GET }
