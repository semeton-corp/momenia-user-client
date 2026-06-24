import { http } from "../http"
import {
    GoogleAuthRequest,
    AuthResponse,
    OAuthResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    LogoutResponse,
    UserProfile,
} from "./auth.types"

const BASE_USERS = "/api/v1/users"
const BASE_SESSIONS = "/api/v1/sessions"

function authHeader(): Record<string, string> {
    const token = globalThis.localStorage?.getItem("accessToken") ?? null
    return token ? { Authorization: `Bearer ${token}` } : {}
}

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
    })
}

export const getMe = async (): Promise<UserProfile> => {
    return http(`${BASE_USERS}/me`, {
        method: "GET",
        headers: authHeader(),
    })
}