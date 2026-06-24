"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { getMe } from "@/lib/api/authentication/auth.service"
import type { UserProfile } from "@/lib/api/authentication/auth.types"

function readStoredUser(): UserProfile | null {
    try {
        const raw = globalThis.localStorage?.getItem("user")
        return raw ? (JSON.parse(raw) as UserProfile) : null
    } catch {
        return null
    }
}

export function useCurrentUser() {
    const token = globalThis.localStorage?.getItem("accessToken") ?? null
    const storedUser = readStoredUser()
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: ["currentUser"],
        queryFn: getMe,
        enabled: !!token,
        staleTime: 5 * 60 * 1000,
        retry: false,
        initialData: token ? (storedUser ?? undefined) : undefined,
    })

    // Keep the cached profile in sync with the latest /me result.
    useEffect(() => {
        if (query.data) {
            globalThis.localStorage?.setItem("user", JSON.stringify(query.data))
        }
    }, [query.data])

    // Only sign the user out on a genuine auth failure (401), not on transient
    // errors (network blips, a 404/500 from /me, etc.) — otherwise a freshly
    // logged-in user gets wiped the moment a background refresh hiccups.
    useEffect(() => {
        const status = (query.error as (Error & { status?: number }) | null)?.status
        if (query.isError && status === 401) {
            globalThis.localStorage?.removeItem("accessToken")
            globalThis.localStorage?.removeItem("refreshToken")
            globalThis.localStorage?.removeItem("user")
            queryClient.removeQueries({ queryKey: ["currentUser"] })
        }
    }, [query.isError, query.error, queryClient])

    const user = query.data ?? (token ? storedUser : null) ?? null

    return {
        user,
        isLoading: !!token && query.isPending && !storedUser,
        isLoggedIn: !!user,
    }
}
