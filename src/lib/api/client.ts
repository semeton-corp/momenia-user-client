import { apiConfig } from "./config"

type BackendFetchOptions = RequestInit & {
  params?: Record<string, string>
}

export async function backendFetch(
  path: string,
  options: BackendFetchOptions = {},
): Promise<Response> {
  const { params, ...init } = options
  const base = apiConfig.baseUrl
  const url = new URL(path.startsWith("/") ? path : `/${path}`, base)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const headers = new Headers(init.headers)
  if (init.body && typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  return fetch(url.toString(), { ...init, headers })
}
