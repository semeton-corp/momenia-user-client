"use client"

import { Link } from "@/i18n/navigation"
import { useOAuthCallback } from "@/hooks/auth/useOAuthCallback"

export default function AuthCallbackClient() {
    const { error } = useOAuthCallback()

    if (error) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white px-6">
                <section className="w-full max-w-md text-center">
                    <p className="text-sm font-medium text-purple-700">Google authentication</p>
                    <h1 className="mt-3 text-2xl font-semibold text-gray-950">
                        We could not finish signing you in.
                    </h1>
                    <p className="mt-3 text-sm text-gray-500">{error}</p>
                    <Link
                        href="/login"
                        className="mt-8 inline-flex rounded-lg bg-purple-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-purple-800"
                    >
                        Back to login
                    </Link>
                </section>
            </main>
        )
    }

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
