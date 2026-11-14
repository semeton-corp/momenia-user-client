import { getAuthHeader } from "./auth-header"
import { routing } from "@/i18n/routing"

const BASE_URL = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_URL

// Proxy and gateway failures may return an entire HTML error page. Keep the
// status for callers, but never use that markup as a user-facing message.
export async function responseError(res: Response): Promise<Error & { status: number }> {
    const body = await res.text()
    const contentType = res.headers.get("content-type") ?? ""
    const isHtml = /\btext\/html\b/i.test(contentType) || /^\s*(?:<!doctype\b|<html\b|<!--)/i.test(body)
    const message = isHtml
        ? res.status === 504
            ? "The server took too long to respond. Please try again."
            : "The server is temporarily unavailable. Please try again."
        : body || "API Error"
    const error = new Error(message) as Error & { status: number }
    error.status = res.status
    return error
}

// POST/PUT/PATCH butuh X-Idempotency-Key supaya backend bisa dedupe kalau client
// kirim request yang sama dua kali bersamaan (mis. double-click).
const IDEMPOTENT_KEY_METHODS = new Set(["POST", "PUT", "PATCH"])

function needsIdempotencyKey(method?: string): boolean {
    return !!method && IDEMPOTENT_KEY_METHODS.has(method.toUpperCase())
}

// An expired access token ends the session. Return dashboard users to the
// dashboard entry point so its authentication gate can handle signing in again.
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

// Confirm session rejection independently of the endpoint that failed. Share the
// check across concurrent failures, and never clear a different/newer login.
const sessionChecks = new Map<string, Promise<boolean>>()
async function isSessionRejected(authorization: string): Promise<boolean> {
    const existing = sessionChecks.get(authorization)
    if (existing) return existing
    const check = (async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/v1/accounts/me`, {
                headers: { Authorization: authorization },
                cache: "no-store",
                signal: AbortSignal.timeout(10_000),
            })
            return response.status === 401
        } catch {
            return false
        }
    })()
    sessionChecks.set(authorization, check)
    try { return await check } finally { sessionChecks.delete(authorization) }
}

export async function http<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const buildHeaders = (): Headers => {
        const headers = new Headers(options?.headers)
        if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json")
        if (needsIdempotencyKey(options?.method) && !headers.has("X-Idempotency-Key")) {
            headers.set("X-Idempotency-Key", crypto.randomUUID())
        }
        return headers
    }

    // Tanpa timeout, request yang macet (mis. backend tidak reachable saat SSG build)
    // akan menggantung sampai worker timeout Next.js (60s x beberapa retry) baru gagal.
    const doFetch = (headers: Headers) =>
        fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
            signal: options?.signal ?? AbortSignal.timeout(10_000),
        })

    const headers = buildHeaders()
    const res = await doFetch(headers)

    const authorization = headers.get("Authorization")
    if (res.status === 401 && authorization && typeof window !== "undefined") {
        const rejected = await isSessionRejected(authorization)
        if (rejected && getAuthHeader().Authorization === authorization) {
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            localStorage.removeItem("user")
            window.dispatchEvent(new Event("auth-session-changed"))
            redirectAfterSessionEnd()
        }
    }

    if (!res.ok) {
        throw await responseError(res)
    }

    // Beberapa endpoint (mis. favourite/unfavourite) balas 200/204 dengan body kosong —
    // res.json() akan throw SyntaxError kalau dipaksa parse string kosong.
    const text = await res.text()
    return (text ? JSON.parse(text) : undefined) as T
}
