"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
    signInWithGoogle,
    signUpWithGoogle,
} from "@/lib/api/authentication/auth.service"

export const useOAuthCallback = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const hasRun = useRef(false)

    useEffect(() => {
        if (hasRun.current) return
        hasRun.current = true

        const code = searchParams.get("code")
        if (!code) return

        setLoading(true)

        const authType = localStorage.getItem("auth_type")

        const run = async () => {
            try {
                let result

                if (authType === "register") {
                    result = await signUpWithGoogle({
                        code,
                        userAgent: navigator.userAgent,
                    })
                } else {
                    result = await signInWithGoogle({
                        code,
                        userAgent: navigator.userAgent,
                    })
                }

                localStorage.setItem("accessToken", result.session.accessToken)
                localStorage.setItem("refreshToken", result.session.refreshToken)

                localStorage.removeItem("auth_type")

                router.replace("/dashboard")
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        run()
    }, [searchParams, router])

    return { loading }
}