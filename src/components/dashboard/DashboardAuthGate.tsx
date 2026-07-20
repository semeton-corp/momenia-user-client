"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { AnimatePresence, motion } from "framer-motion"
import { Lock, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link, usePathname, useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { useCurrentUser } from "@/hooks/auth/useCurrentUser"
import { PROTECTED_DASHBOARD_PATHS } from "@/lib/dashboard-protected-paths"

type AuthGateContextValue = {
  /** Buka modal login-required di halaman saat ini, tanpa berpindah route. */
  requestAccess: () => void
}

const AuthGateContext = React.createContext<AuthGateContextValue | null>(null)

export function useAuthGate() {
  const ctx = React.useContext(AuthGateContext)
  if (!ctx) throw new Error("useAuthGate must be used within DashboardAuthGateProvider")
  return ctx
}

export function DashboardAuthGateProvider({ children }: { readonly children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations("dashboard.authGate")
  const { isLoggedIn, isLoading } = useCurrentUser()
  const [isClosing, setIsClosing] = React.useState(false)
  // Dipicu manual dari sidebar/bottom-nav saat user klik menu terkunci —
  // modal langsung tampil di halaman saat ini, tanpa pindah route.
  const [manualOpen, setManualOpen] = React.useState(false)

  const normalizedPath = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname
  const isProtectedRoute = PROTECTED_DASHBOARD_PATHS.has(normalizedPath)
  const routeTriggered = isProtectedRoute && !isLoading && !isLoggedIn
  const shouldOpen = routeTriggered || manualOpen
  const isOpen = shouldOpen && !isClosing

  React.useEffect(() => {
    if (shouldOpen) setIsClosing(false)
  }, [shouldOpen, normalizedPath])

  // Kalau user berhasil login sementara modal manual terbuka, tutup otomatis.
  React.useEffect(() => {
    if (isLoggedIn) setManualOpen(false)
  }, [isLoggedIn])

  const closeAndRedirect = React.useCallback(() => {
    setIsClosing(true)
    globalThis.setTimeout(() => {
      setManualOpen(false)
      // Hanya redirect balik ke /dashboard kalau modal muncul karena user
      // benar-benar berada di route terkunci (bukan trigger manual).
      if (routeTriggered) router.replace("/dashboard")
    }, 220)
  }, [router, routeTriggered])

  const requestAccess = React.useCallback(() => {
    setManualOpen(true)
  }, [])

  const handleOpenChange = (open: boolean) => {
    if (!open) closeAndRedirect()
  }

  return (
    <AuthGateContext.Provider value={{ requestAccess }}>
      {children}

      <DialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[120] bg-black/55 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                className="fixed left-1/2 top-1/2 z-[121] w-[calc(100vw-32px)] max-w-[601px] -translate-x-1/2 -translate-y-1/2 rounded-[10px] border border-zinc-200 bg-white p-8 shadow-2xl outline-none xl:w-[601px] xl:p-10"
                initial={{ opacity: 0, y: 20, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.97 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  className="flex flex-col items-center text-center"
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
                  }}
                >
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } },
                    }}
                    className="mx-auto flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-primary xl:h-[98px] xl:w-[98px]"
                  >
                    <Lock className="h-10 w-10 xl:h-12 xl:w-12" />
                  </motion.div>

                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } },
                    }}
                  >
                    <DialogPrimitive.Title className="mt-6 text-center text-2xl font-semibold text-[#000000]">
                      {t("title")}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="mt-2 text-center text-sm font-normal text-[#000000]">
                      {t("description")}
                    </DialogPrimitive.Description>
                  </motion.div>

                  <motion.div
                    className="mt-10 flex w-full flex-col gap-3 xl:w-auto xl:flex-row xl:gap-6"
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } },
                    }}
                  >
                    <Button asChild className="h-10 w-full rounded-[10px] text-sm font-semibold xl:w-[252.5px]">
                      <Link href="/login">{t("login")}</Link>
                    </Button>
                    <Button asChild variant="outline" className="h-10 w-full rounded-[10px] text-sm font-semibold xl:w-[252.5px]">
                      <Link href="/register">{t("signUp")}</Link>
                    </Button>
                  </motion.div>

                </motion.div>

                <DialogPrimitive.Close asChild>
                  <motion.button
                    type="button"
                    aria-label={t("close")}
                    className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                    initial={{ opacity: 0, scale: 0.85, rotate: -12 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </DialogPrimitive.Close>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
      </DialogPrimitive.Root>
    </AuthGateContext.Provider>
  )
}
