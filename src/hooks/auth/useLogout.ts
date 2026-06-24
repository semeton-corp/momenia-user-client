"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"
import { logout } from "@/lib/api/authentication/auth.service"

export function useLogout() {
    const queryClient = useQueryClient()
    const router = useRouter()
    const locale = useLocale()

    return useMutation({
        mutationFn: async () => {
            try {
                await logout()
            } catch {
                // always clear local state even if API call fails
            }
        },
        onSettled: () => {
            globalThis.localStorage?.removeItem("accessToken")
            globalThis.localStorage?.removeItem("refreshToken")
            globalThis.localStorage?.removeItem("user")
            queryClient.clear()
            router.replace(`/${locale}`)
        },
    })
}
