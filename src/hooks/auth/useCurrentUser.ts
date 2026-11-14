"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { getMe } from "@/lib/api/authentication/auth.service"
import { resolveObjectUrl } from "@/lib/api/object/object.service"
import type { UserProfile } from "@/lib/api/authentication/auth.types"

type StoredSession = {
    token: string | null
    storedUser: UserProfile | null
}

function readStoredSession(): StoredSession {
    try {
        // Clean up storage from the previous refresh-token authentication flow.
        localStorage.removeItem("refreshToken")
        const token = localStorage.getItem("accessToken")
        const raw = localStorage.getItem("user")
        let storedUser: UserProfile | null = null
        try {
            const parsed = raw ? JSON.parse(raw) : null
            if (parsed && typeof parsed.email === "string" && typeof parsed.name === "string") {
                storedUser = parsed as UserProfile
            }
        } catch {
            // A damaged profile cache must not discard a valid token.
            localStorage.removeItem("user")
        }
        // profilePicture bisa berupa key objek mentah (mis. "avatar/ava_xxx")
        // kalau tersimpan sebelum normalisasi service diterapkan — ubah ke URL
        // publik supaya next/image di sidebar/header tidak crash.
        if (typeof storedUser?.profilePicture === "string" && storedUser.profilePicture) {
            storedUser.profilePicture = resolveObjectUrl(storedUser.profilePicture)
        }
        return { token, storedUser }
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
        const syncSession = () => setSession(readStoredSession())
        const syncStorage = (event: StorageEvent) => {
            if (event.key !== "accessToken" && event.key !== null) return
            void queryClient.cancelQueries({ queryKey: ["currentUser"] })
            queryClient.removeQueries({ queryKey: ["currentUser"] })
            syncSession()
        }
        syncSession()
        window.addEventListener("storage", syncStorage)
        window.addEventListener("auth-session-changed", syncSession)
        return () => {
            window.removeEventListener("storage", syncStorage)
            window.removeEventListener("auth-session-changed", syncSession)
        }
    }, [queryClient])

    const mounted = session !== null
    const token = session?.token ?? null
    const storedUser = session?.storedUser ?? null

    const query = useQuery({
        queryKey: ["currentUser"],
        queryFn: ({ signal }) => getMe(signal),
        enabled: mounted && !!token,
        staleTime: 5 * 60 * 1000,
        retry: false,
        initialData: token ? (storedUser ?? undefined) : undefined,
    })

    // Keep the cached profile in sync with the latest /me result.
    useEffect(() => {
        if (query.data && token && localStorage.getItem("accessToken") === token) {
            globalThis.localStorage?.setItem("user", JSON.stringify(query.data))
        }
    }, [query.data, token])

    // Session invalidation is centralized in http(): only a confirmed rejection
    // for the current token can clear storage. An endpoint's 401 alone cannot.
    const user = token ? (query.data ?? storedUser ?? null) : null

    return {
        user,
        // Sebelum mount statusnya "loading" — server & client sama-sama render
        // placeholder, baru setelah mount ditentukan login/logout.
        isLoading: !mounted || (!!token && query.isPending && !storedUser),
        isLoggedIn: !!user,
    }
}
