export type GoogleAuthRequest = {
    code: string
    userAgent: string
}

export type RefreshTokenRequest = {
    refreshToken: string
    userAgent: string
}

export type AuthResponse = {
    email: string
    name: string
    profilePicture: string
    session: {
        accessToken: string
        refreshToken: string
    }
}

export type OAuthResponse = {
    redirectUrl: string
}

export type RefreshTokenResponse = {
    accessToken: string
    refreshToken: string
}

// logout has no body (204)
export type LogoutResponse = void

export type UserProfile = {
  email: string
  name: string
  profilePicture: string
}

export type Account = {
    id: string
    name: string
    email: string
    phoneNumber: string
    profilePicture: string
    createdAt: string
}

export type UpdateAccountRequest = {
    name: string
    phoneNumber: string
    profilePicture: string
}