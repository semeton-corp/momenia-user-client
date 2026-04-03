"use client"

import { getGoogleOAuth } from "@/lib/api/authentication/auth.service"
import { useMutation } from "@tanstack/react-query"


export const useGoogleOAuth = () => {
    return useMutation({
        mutationFn: getGoogleOAuth,

        onSuccess: (data) => {
            window.location.href = data.redirectUrl
        },
    })
}