export type GoogleAuthRequest = {
    code: string
    userAgent: string
}

export type AuthResponse = {
    email: string
    name: string
    profilePicture: string
    session: {
        accessToken: string
    }
}

export type OAuthResponse = {
    redirectUrl: string
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