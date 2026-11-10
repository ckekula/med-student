import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

// Must exceed the backend's worst-case LLM call (timeout x (retries + 1)).
const UPSTREAM_TIMEOUT_MS = 90_000
const FORWARDED_REQUEST_HEADERS = ["authorization", "content-type", "accept"]

type RouteContext = { params: Promise<{ path: string[] }> }

async function proxy(request: NextRequest, { params }: RouteContext): Promise<Response> {
  const backendUrl = process.env.API_URL
  if (!backendUrl) {
    return Response.json({ detail: "API_URL is not configured" }, { status: 500 })
  }

  const { path } = await params
  const target = `${backendUrl}/api/v1/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`

  const headers = new Headers()
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD"

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)]),
    })

    const responseHeaders = new Headers()
    const contentType = upstream.headers.get("content-type")
    if (contentType) responseHeaders.set("content-type", contentType)

    return new Response(upstream.status === 204 ? null : upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    })
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 }) // client went away
    const timedOut = error instanceof DOMException && error.name === "TimeoutError"
    return Response.json(
      { detail: timedOut ? "Upstream timed out" : "Upstream unavailable" },
      { status: timedOut ? 504 : 502 },
    )
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE }
