"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
    signInWithGoogle,
    signUpWithGoogle,
} from "@/lib/api/authentication/auth.service"

export const useOAuthCallback = () => {
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const code = searchParams.get("code")
        if (!code) return

        const authType = localStorage.getItem("auth_type")

        const run = async () => {
            try {
                if (authType === "register") {
                    const result = await signUpWithGoogle({
                        code,
                        userAgent: navigator.userAgent,
                    })

                    // ✅ store tokens
                    localStorage.setItem("accessToken", result.session.accessToken)
                    localStorage.setItem("refreshToken", result.session.refreshToken)
                } else {
                    await signInWithGoogle({
                        code,
                        userAgent: navigator.userAgent,
                    })
                }

                localStorage.removeItem("auth_type")

                router.replace("/dashboard")
            } catch (err) {
                console.error(err)
            }
        }

        run()
    }, [searchParams, router])
}