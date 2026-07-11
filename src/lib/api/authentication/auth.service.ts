import { http } from "../http"
import { getAuthHeader as authHeader } from "../auth-header"
import { resolveObjectUrl, toObjectKey } from "../object/object.service"
import {
    GoogleAuthRequest,
    AuthResponse,
    OAuthResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    LogoutResponse,
    UserProfile,
    Account,
    UpdateAccountRequest,
} from "./auth.types"

const BASE_USERS = "/api/v1/users"
const BASE_SESSIONS = "/api/v1/sessions"
const BASE_ACCOUNTS = "/api/v1/accounts"

export const signUpWithGoogle = async (
    data: GoogleAuthRequest
): Promise<AuthResponse> => {
    return http(`${BASE_USERS}/signup/google`, {
        method: "POST",
        body: JSON.stringify(data),
    })
}

export const signInWithGoogle = async (
    data: GoogleAuthRequest
): Promise<AuthResponse> => {
    return http(`${BASE_USERS}/signin/google`, {
        method: "POST",
        body: JSON.stringify(data),
    })
}

export const getGoogleOAuth = async (): Promise<OAuthResponse> => {
    return http(`${BASE_USERS}/oauth/google`, {
        method: "GET",
    })
}

export const getOauthSignUpGoogle = async (): Promise<OAuthResponse> => {
    return http(`${BASE_USERS}/signup/google`, {
        method: "GET",
    })
}

export const getOauthSignInGoogle = async (): Promise<OAuthResponse> => {
    return http(`${BASE_USERS}/signin/google`, {
        method: "GET",
    })
}

export const refreshToken = async (
    data: RefreshTokenRequest
): Promise<RefreshTokenResponse> => {
    return http(`${BASE_SESSIONS}/refresh`, {
        method: "POST",
        body: JSON.stringify(data),
    })
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

export const getMe = async (): Promise<UserProfile> => {
    return http(`${BASE_USERS}/me`, {
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