import { QueryClient } from "@tanstack/react-query"

const defaultOptions = {
  queries: {
    staleTime: 60 * 1000, // 1 menit
    refetchOnWindowFocus: false,
  },
}

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions,
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient()
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}
