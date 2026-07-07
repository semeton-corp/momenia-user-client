"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { getMe } from "@/lib/api/authentication/auth.service"
import type { UserProfile } from "@/lib/api/authentication/auth.types"

type StoredSession = {
    token: string | null
    storedUser: UserProfile | null
}

function readStoredSession(): StoredSession {
    try {
        const token = localStorage.getItem("accessToken")
        const raw = localStorage.getItem("user")
        return {
            token,
            storedUser: raw ? (JSON.parse(raw) as UserProfile) : null,
        }
    } catch {
        return { token: null, storedUser: null }
    }
}

export function useCurrentUser() {
    // localStorage hanya dibaca SETELAH mount supaya render pertama client
    // identik dengan HTML server (hindari hydration mismatch).
    const [session, setSession] = useState<StoredSession | null>(null)
    const queryClient = useQueryClient()

    useEffect(() => {
        setSession(readStoredSession())
    }, [])

    const mounted = session !== null
    const token = session?.token ?? null
    const storedUser = session?.storedUser ?? null

    const query = useQuery({
        queryKey: ["currentUser"],
        queryFn: getMe,
        enabled: mounted && !!token,
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
            setSession({ token: null, storedUser: null })
        }
    }, [query.isError, query.error, queryClient])

    const user = query.data ?? (token ? storedUser : null) ?? null

    return {
        user,
        // Sebelum mount statusnya "loading" — server & client sama-sama render
        // placeholder, baru setelah mount ditentukan login/logout.
        isLoading: !mounted || (!!token && query.isPending && !storedUser),
        isLoggedIn: !!user,
    }
}
