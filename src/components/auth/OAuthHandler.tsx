"use client"

import { useOAuthCallback } from "@/hooks/auth/useOAuthCallback"
import LoadingScreen from "../ui/loadingScreen"

export default function OAuthHandler() {
    const { loading } = useOAuthCallback()

    if (loading) return <LoadingScreen />

    return null
}