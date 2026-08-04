"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export default function QueryProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: (failureCount, error) => {
                            // http() sudah mencoba refresh token sebelum melempar — kalau
                            // tetap 401/403, mengulang cuma menghasilkan request gagal
                            // beruntun yang memenuhi Network tab tanpa pernah berhasil.
                            // 404 juga final — resource memang tidak ada/bukan milik user.
                            const status = (error as Error & { status?: number }).status
                            if (status === 401 || status === 403 || status === 404) return false
                            return failureCount < 3
                        },
                    },
                },
            }),
    )

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}