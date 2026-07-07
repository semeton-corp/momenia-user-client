import { sanitizeToken } from "./auth-header"

const BASE_URL = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.NEXT_PUBLIC_API_KEY

// Satu refresh berjalan bersama untuk semua request yang 401 berbarengan.
let refreshPromise: Promise<boolean> | null = null

async function tryRefreshSession(): Promise<boolean> {
    if (typeof window === "undefined") return false
    const rawRefreshToken = localStorage.getItem("refreshToken")
    const refreshToken = rawRefreshToken ? sanitizeToken(rawRefreshToken) : null
    if (!refreshToken) return false

    refreshPromise ??= (async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/v1/sessions/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": API_KEY!,
                },
                body: JSON.stringify({ refreshToken, userAgent: navigator.userAgent }),
            })
            if (!res.ok) {
                // Refresh token ikut mati → sesi benar-benar berakhir, bersihkan.
                localStorage.removeItem("accessToken")
                localStorage.removeItem("refreshToken")
                localStorage.removeItem("user")
                return false
            }
            const data: { accessToken: string; refreshToken: string } = await res.json()
            localStorage.setItem("accessToken", data.accessToken)
            if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken)
            return true
        } catch {
            return false
        } finally {
            refreshPromise = null
        }
    })()

    return refreshPromise
}

export async function http<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const buildHeaders = (): Record<string, string> => ({
        "Content-Type": "application/json",
        "x-api-key": API_KEY!,
        ...((options?.headers as Record<string, string>) || {}),
    })

    const doFetch = (headers: Record<string, string>) =>
        fetch(`${BASE_URL}${endpoint}`, { ...options, headers })

    let headers = buildHeaders()
    let res = await doFetch(headers)

    // Access token kadaluarsa → refresh sekali, lalu ulangi request dengan token baru.
    if (res.status === 401 && headers.Authorization && typeof window !== "undefined") {
        const refreshed = await tryRefreshSession()
        if (refreshed) {
            const rawToken = localStorage.getItem("accessToken") ?? ""
            headers = { ...headers, Authorization: `Bearer ${sanitizeToken(rawToken)}` }
            res = await doFetch(headers)
        }
    }

    if (!res.ok) {
        const message = await res.text()
        const error = new Error(message || "API Error") as Error & { status?: number }
        error.status = res.status
        throw error
    }

    return res.json()
}
