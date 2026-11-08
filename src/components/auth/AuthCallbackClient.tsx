"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "@/i18n/navigation"
import { useToast } from "@/providers/ToastProvider"
import { useOAuthCallback } from "@/hooks/auth/useOAuthCallback"

export default function AuthCallbackClient() {
    const { error } = useOAuthCallback()

    const router = useRouter()
    const { toast } = useToast()
    const redirected = useRef(false)

    useEffect(() => {
        if (!error || redirected.current) return
        redirected.current = true
        toast("Login failed. Please try again.", "error")
        router.replace("/login")
    }, [error, router, toast])

    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-6">
            <section className="flex flex-col items-center gap-4 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-700 border-t-transparent" />
                <div>
                    <h1 className="text-xl font-semibold text-gray-950">
                        Finishing Google authentication
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Please wait while we prepare your session.
                    </p>
                </div>
            </section>
        </main>
    )
}
