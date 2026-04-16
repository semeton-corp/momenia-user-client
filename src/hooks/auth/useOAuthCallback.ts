"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useLocale } from "next-intl"
import {
    signInWithGoogle,
    signUpWithGoogle,
} from "@/lib/api/authentication/auth.service"

type OAuthAction = "signin" | "signup"

const resolveOAuthAction = (
    queryAction: string | null,
    storedAction: string | null
): OAuthAction | null => {
    const action = queryAction ?? storedAction

    if (action === "signin" || action === "login") return "signin"
    if (action === "signup" || action === "register") return "signup"

    return null
}

export const useOAuthCallback = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const locale = useLocale()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const hasRun = useRef(false)

    useEffect(() => {
        if (hasRun.current) return
        hasRun.current = true

        const code = searchParams.get("code")
        const action = resolveOAuthAction(
            searchParams.get("action"),
            localStorage.getItem("auth_type")
        )

        if (!code) {
            setError("Missing Google authorization code.")
            return
        }

        if (!action) {
            setError("Missing or invalid Google auth action.")
            return
        }

        const run = async () => {
            setLoading(true)
            setError(null)

            try {
                const payload = {
                    code,
                    userAgent: navigator.userAgent,
                }

                const result =
                    action === "signup"
                        ? await signUpWithGoogle(payload)
                        : await signInWithGoogle(payload)

                localStorage.setItem("accessToken", result.session.accessToken)
                localStorage.setItem("refreshToken", result.session.refreshToken)
                localStorage.removeItem("auth_type")

                router.replace(`/${locale}/dashboard`)
            } catch (err) {
                console.error(err)
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to finish Google authentication."
                )
            } finally {
                setLoading(false)
            }
        }

        run()
    }, [locale, router, searchParams])

    return { loading, error }
}
