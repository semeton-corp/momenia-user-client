"use client"

import * as React from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { LogOut } from "lucide-react"
import LogoMemoria from "@/assets/logo/logo-memoria.png"
import { Link } from "@/i18n/navigation"
import { useCurrentUser } from "@/hooks/auth/useCurrentUser"
import { useLogout } from "@/hooks/auth/useLogout"

export function DashboardMobileHeader() {
  const tNavbar = useTranslations("navbar")
  const { user, isLoggedIn, isLoading } = useCurrentUser()
  const { mutate: doLogout, isPending: isLoggingOut } = useLogout()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [menuOpen])

  return (
    <header className="flex items-center justify-between px-5 py-4 xl:hidden">
      <Link href="/dashboard" className="flex items-center">
        <Image src={LogoMemoria} alt="Momenia" className="h-7 w-auto" priority />
      </Link>

      {isLoading ? (
        <div className="h-9 w-9 animate-pulse rounded-full bg-zinc-100" />
      ) : isLoggedIn && user ? (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-white transition-all hover:ring-indigo-200"
            title={user.name}
          >
            {user.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt={user.name}
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-xs font-semibold text-indigo-700">
                {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
              <div className="border-b border-zinc-100 px-4 py-3">
                <p className="truncate text-sm font-semibold text-zinc-900">{user.name}</p>
                <p className="truncate text-xs text-zinc-400">{user.email}</p>
              </div>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => { setMenuOpen(false); doLogout() }}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/login">
            <button
              type="button"
              className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {tNavbar("login")}
            </button>
          </Link>
          <Link href="/register">
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition-opacity hover:opacity-90"
            >
              {tNavbar("signUp")}
            </button>
          </Link>
        </div>
      )}
    </header>
  )
}
