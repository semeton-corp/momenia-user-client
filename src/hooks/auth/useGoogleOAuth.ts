"use client"

import { getOauthSignInGoogle, getOauthSignUpGoogle } from "@/lib/api/authentication/auth.service"
import { useMutation } from "@tanstack/react-query"


export const useSignInGoogleOAuth = () => {
    return useMutation({
        mutationFn: getOauthSignInGoogle,

        onSuccess: (data) => {
            window.location.href = data.redirectUrl
        },
    })
}

export const useSignUpGoogleOAuth = () => {
    return useMutation({
        mutationFn: getOauthSignUpGoogle,

        onSuccess: (data) => {
            window.location.href = data.redirectUrl
        },
    })
}