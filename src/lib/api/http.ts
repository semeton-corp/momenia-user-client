import { sanitizeToken } from "./auth-header"
import { routing } from "@/i18n/routing"

const BASE_URL = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_URL

// POST/PUT/PATCH butuh X-Idempotency-Key supaya backend bisa dedupe kalau client
// kirim request yang sama dua kali bersamaan (mis. double-click).
const IDEMPOTENT_KEY_METHODS = new Set(["POST", "PUT", "PATCH"])

function needsIdempotencyKey(method?: string): boolean {
    return !!method && IDEMPOTENT_KEY_METHODS.has(method.toUpperCase())
}

// Satu refresh berjalan bersama untuk semua request yang 401 berbarengan.
let refreshPromise: Promise<boolean> | null = null

// Sesi benar-benar habis (refresh token ditolak). Tanpa ini user ditinggal di
// halaman dashboard yang terus melempar 401 tanpa penjelasan — lempar balik ke
// /dashboard, biar auth gate di sana yang menampilkan modal login.
// Hard redirect (bukan router.push) supaya cache React Query yang sudah basi ikut hilang.
function redirectAfterSessionEnd(): void {
    if (typeof window === "undefined") return

    const path = window.location.pathname
    // Di luar dashboard (landing/login), sesi mati cukup ditandai dengan token
    // yang sudah dibersihkan — memaksa pindah halaman malah mengagetkan.
    if (!path.includes("/dashboard")) return

    const segments = path.split("/")
    const locale = (routing.locales as readonly string[]).includes(segments[1])
        ? segments[1]
        : routing.defaultLocale

    const target = `/${locale}/dashboard`
    if (path === target) return
    window.location.replace(target)
}

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
                    "X-Idempotency-Key": crypto.randomUUID(),
                },
                body: JSON.stringify({ refreshToken, userAgent: navigator.userAgent }),
            })
            if (!res.ok) {
                // Refresh token ikut mati → sesi benar-benar berakhir, bersihkan.
                localStorage.removeItem("accessToken")
                localStorage.removeItem("refreshToken")
                localStorage.removeItem("user")
                redirectAfterSessionEnd()
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
        ...(needsIdempotencyKey(options?.method) ? { "X-Idempotency-Key": crypto.randomUUID() } : {}),
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

    // Beberapa endpoint (mis. favourite/unfavourite) balas 200/204 dengan body kosong —
    // res.json() akan throw SyntaxError kalau dipaksa parse string kosong.
    const text = await res.text()
    return (text ? JSON.parse(text) : undefined) as T
}
