const BASE_URL = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.NEXT_PUBLIC_API_KEY

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function tryRefreshToken(): Promise<string | null> {
    if (isRefreshing) return refreshPromise

    const storedRefreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null
    if (!storedRefreshToken) return null

    isRefreshing = true
    refreshPromise = fetch(`${BASE_URL}/api/v1/sessions/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY!,
        },
        body: JSON.stringify({ refreshToken: storedRefreshToken, userAgent: navigator.userAgent }),
    })
        .then(async (res) => {
            if (!res.ok) return null
            const data = await res.json()
            const newAccessToken: string | null = data?.accessToken ?? null
            const newRefreshToken: string | null = data?.refreshToken ?? null
            if (newAccessToken) localStorage.setItem("accessToken", newAccessToken)
            if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken)
            return newAccessToken
        })
        .catch(() => null)
        .finally(() => {
            isRefreshing = false
            refreshPromise = null
        })

    return refreshPromise
}

async function fetchWithAuth<T>(endpoint: string, options?: RequestInit, retries = 3): Promise<T> {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY!,
            ...authHeaders,
            ...(options?.headers || {}),
        },
    })

    if (res.status === 401 && retries > 0) {
        const newToken = await tryRefreshToken()
        if (!newToken) {
            const message = await res.text()
            const error = new Error(message || "Unauthorized") as Error & { status?: number }
            error.status = 401
            throw error
        }
        return fetchWithAuth<T>(endpoint, options, retries - 1)
    }

    if (!res.ok) {
        const message = await res.text()
        const error = new Error(message || "API Error") as Error & { status?: number }
        error.status = res.status
        throw error
    }

    return res.json()
}

export async function http<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return fetchWithAuth<T>(endpoint, options)
}
