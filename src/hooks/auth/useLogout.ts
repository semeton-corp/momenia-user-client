"use client"

import { useMutation } from "@tanstack/react-query"
import { useLocale } from "next-intl"
import { logout } from "@/lib/api/authentication/auth.service"

export function useLogout() {
    const locale = useLocale()

    return useMutation({
        mutationFn: async () => {
            // 1) Kirim request logout SELAGI token masih ada. http() membangun header
            //    (baca localStorage) secara sinkron & men-dispatch fetch sebelum
            //    promise-nya balik, jadi aman dibersihkan setelah ini. keepalive di
            //    service memastikan request tetap jalan walau halaman langsung pindah.
            logout().catch(() => {})

            // 2) Bersihkan sesi lokal.
            globalThis.localStorage?.removeItem("accessToken")
            globalThis.localStorage?.removeItem("refreshToken")
            globalThis.localStorage?.removeItem("user")

            // 3) Hard redirect ke root (bukan client-side) supaya dashboard tidak
            //    sempat re-render dalam keadaan logged-out — hilangkan glitch/delay,
            //    langsung mental ke halaman awal dengan state bersih.
            window.location.replace(`/${locale}`)
        },
    })
}
