"use client"

import { useOAuthCallback } from "@/hooks/auth/useOAuthCallback"



export default function OAuthHandler() {
    useOAuthCallback()

    return null // no UI needed
}