"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import LogoMemoria from "@/assets/logo/logo-memoria.png"
import { Link } from "@/i18n/navigation"
import { useCurrentUser } from "@/hooks/auth/useCurrentUser"

export function DashboardMobileHeader() {
  const tNavbar = useTranslations("navbar")
  const { user, isLoggedIn, isLoading } = useCurrentUser()

  return (
    <header className="flex items-center justify-between px-5 py-4 xl:hidden">
      <Link href="/dashboard" className="flex items-center">
        <Image src={LogoMemoria} alt="Momenia" className="h-9 w-auto" priority />
      </Link>

      {isLoading ? (
        <div className="h-9 w-9 animate-pulse rounded-full bg-zinc-100" />
      ) : isLoggedIn && user ? (
        <Link
          href="/dashboard/profile"
          className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-white transition-all hover:ring-indigo-200"
          title={user.name}
        >
          {user.profilePicture ? (
            <Image
              src={user.profilePicture}
              alt={user.name}
              width={36}
              height={36}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-xs font-semibold text-indigo-700">
              {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
          )}
        </Link>
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
