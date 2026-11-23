"use client"

import { googleOAuthStartUrl } from "@/lib/api/authentication/auth.service"
import { useMutation } from "@tanstack/react-query"

const startGoogleOAuth = (action: "signin" | "signup") => async () => {
    window.location.assign(googleOAuthStartUrl(action))
}

export const useSignInGoogleOAuth = () => {
    return useMutation({ mutationFn: startGoogleOAuth("signin") })
}

export const useSignUpGoogleOAuth = () => {
    return useMutation({ mutationFn: startGoogleOAuth("signup") })
}
