"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getAccountMe, updateAccount } from "@/lib/api/authentication/auth.service"
import type { UpdateAccountRequest, UserProfile } from "@/lib/api/authentication/auth.types"

export const ACCOUNT_QUERY_KEY = ["account", "me"] as const

export function useAccount() {
    return useQuery({
        queryKey: ACCOUNT_QUERY_KEY,
        queryFn: getAccountMe,
        staleTime: 5 * 60 * 1000,
    })
}

export function useUpdateAccount() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UpdateAccountRequest) => updateAccount(data),
        onSuccess: (account) => {
            queryClient.setQueryData(ACCOUNT_QUERY_KEY, account)

            // Sinkronkan cache "currentUser" + localStorage supaya nama/avatar di
            // sidebar & header ikut ter-update tanpa perlu reload halaman.
            queryClient.setQueryData(["currentUser"], (prev: UserProfile | undefined) =>
                prev ? { ...prev, name: account.name, profilePicture: account.profilePicture } : prev,
            )

            const storedRaw = localStorage.getItem("user")
            if (storedRaw) {
                try {
                    const stored = JSON.parse(storedRaw) as UserProfile
                    localStorage.setItem(
                        "user",
                        JSON.stringify({ ...stored, name: account.name, profilePicture: account.profilePicture }),
                    )
                } catch {
                    // biarkan cache lama kalau ternyata rusak/tidak valid
                }
            }
        },
    })
}
