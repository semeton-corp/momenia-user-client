import { http } from "../http"
import { getAuthHeader as authHeader } from "../auth-header"
import { resolveObjectUrl, toObjectKey } from "../object/object.service"
import {
    GoogleAuthRequest,
    AuthResponse,
    LogoutResponse,
    UserProfile,
    Account,
    UpdateAccountRequest,
} from "./auth.types"

const BASE_USERS = "/api/v1/users"
const BASE_SESSIONS = "/api/v1/sessions"
const BASE_ACCOUNTS = "/api/v1/accounts"
// Sign-in/up go straight to the API host (CORS + credentials), like the admin client,
// so the HttpOnly refresh_token cookie is stored for the API host — where
// /sessions/refresh (also called directly, see http.ts) can read it.
const DIRECT_USERS = `${process.env.NEXT_PUBLIC_API_URL}${BASE_USERS}`
// Google authentication includes backend-to-Google requests. Allow more time
// than ordinary API reads without automatically replaying a single-use code.
const GOOGLE_AUTH_TIMEOUT_MS = 60_000

export const signUpWithGoogle = async (
    data: GoogleAuthRequest
): Promise<AuthResponse> => {
    return http(`${DIRECT_USERS}/signup/google`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(GOOGLE_AUTH_TIMEOUT_MS),
    })
}

export const signInWithGoogle = async (
    data: GoogleAuthRequest
): Promise<AuthResponse> => {
    return http(`${DIRECT_USERS}/signin/google`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(GOOGLE_AUTH_TIMEOUT_MS),
    })
}

// Google mengembalikan user ke host API, jadi cookie oauth_state harus diset oleh host
// API itu sendiri. Navigasi top-level ke endpoint /redirect membuat API menyetel cookie
// itu sebagai first-party lalu me-redirect ke Google — tanpa fetch cross-origin. Callback
// kemudian kembali ke redirect_origin (origin ini, harus ada di CORS_ALLOWED_ORIGINS
// server), jadi localhost tidak dilempar ke situs staging.
export function googleOAuthStartUrl(action: "signin" | "signup"): string {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}${BASE_USERS}/${action}/google/redirect`)
    url.searchParams.set("redirect_origin", window.location.origin)
    return url.toString()
}

export const logout = async (): Promise<LogoutResponse> => {
    return http(`${BASE_SESSIONS}/logout`, {
        method: "POST",
        headers: authHeader(),
        // keepalive supaya request tetap terkirim walau kita langsung pindah halaman
        // (hard redirect) tanpa menunggu response — bikin logout terasa instan.
        keepalive: true,
    })
}

export const getMe = async (signal?: AbortSignal): Promise<UserProfile> => {
    return http(`${BASE_ACCOUNTS}/me`, {
        signal,
        cache: "no-store",
        method: "GET",
        headers: authHeader(),
    })
}

// Backend menyimpan profilePicture hasil upload sebagai key objek mentah
// (mis. "avatar/ava_xxx") — normalisasi ke URL publik supaya semua pemakai
// (sidebar, header, halaman profil) bisa langsung menampilkannya.
function withResolvedPicture(account: Account): Account {
    return { ...account, profilePicture: resolveObjectUrl(account.profilePicture) }
}

export const getAccountMe = async (): Promise<Account> => {
    const account = await http<Account>(`${BASE_ACCOUNTS}/me`, {
        method: "GET",
        headers: authHeader(),
    })
    return withResolvedPicture(account)
}

export const updateAccount = async (data: UpdateAccountRequest): Promise<Account> => {
    const account = await http<Account>(`${BASE_ACCOUNTS}/me`, {
        method: "PUT",
        headers: authHeader(),
        body: JSON.stringify({ ...data, profilePicture: toObjectKey(data.profilePicture) }),
    })
    return withResolvedPicture(account)
}
