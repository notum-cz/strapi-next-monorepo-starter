import { env } from '@/env.mjs'

/**
 * This route handler acts as a proxy for frontend requests with two primary goals:
 * hide authenticated API token from the client (for both SSR and also for client-side components),
 * hide backend URL, so that it cannot be accessed directly
 *
 * @param request fetch request
 * @param anonymous query parameters of the request
 * @returns Strapi response with Readonly API token
 */

async function handler(request: Request, { params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params
	const path = Array.isArray(slug) ? slug.join('/') : slug

	const { search } = new URL(request.url)

	const url = `${env.STRAPI_URL}/${path}${search ?? ''}`

	const clonedRequest = request.clone()

	// Extract the body explicitly from the cloned request
	const body =
		request.method !== 'GET' && request.method !== 'HEAD' ? await clonedRequest.text() : undefined

	const token =
		request.method === 'GET' ? env.STRAPI_REST_READONLY_API_KEY : env.STRAPI_REST_CUSTOM_API_KEY

	const response = await fetch(url, {
		headers: {
			...Object.fromEntries(clonedRequest.headers), // Convert headers to object
			Authorization: `Bearer ${token}`,
		},
		body,
		// this needs to be explicitly stated, because it defaulted to GET
		method: request.method,
	})

	return response
}

export { handler as GET, handler as POST, handler as PUT }
