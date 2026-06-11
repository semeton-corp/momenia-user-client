"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { getMe } from "@/lib/api/authentication/auth.service"

export function useCurrentUser() {
    const token = globalThis.localStorage?.getItem("accessToken") ?? null
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: ["currentUser"],
        queryFn: getMe,
        enabled: !!token,
        staleTime: 5 * 60 * 1000,
        retry: false,
    })

    // Clear stale token on 401
    useEffect(() => {
        if (query.isError) {
            globalThis.localStorage?.removeItem("accessToken")
            globalThis.localStorage?.removeItem("refreshToken")
            queryClient.removeQueries({ queryKey: ["currentUser"] })
        }
    }, [query.isError, queryClient])

    return {
        user: query.data ?? null,
        isLoading: !!token && query.isPending,
        isLoggedIn: !!query.data,
    }
}
