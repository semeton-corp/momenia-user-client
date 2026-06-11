"use client"

import * as React from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { LayoutGrid, FolderOpen, Heart, CircleDollarSign, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useZoomScale } from "@/hooks/use-zoom-scale"
import LogoIcon from "@/assets/logo/logo-momenia.svg"
import { Link, usePathname } from "@/i18n/navigation"
import { useCurrentUser } from "@/hooks/auth/useCurrentUser"
import { useLogout } from "@/hooks/auth/useLogout"

const navItems = [
  { id: "template",      labelKey: "template",      icon: LayoutGrid,       href: "/dashboard" },
  { id: "my-invitation", labelKey: "myInvitation",  icon: FolderOpen,       href: "/dashboard/my-invitation" },
  { id: "favourite",     labelKey: "favorite",      icon: Heart,            href: "/dashboard/favourite" },
  { id: "transaction",   labelKey: "transaction",   icon: CircleDollarSign, href: "/dashboard/transaction" },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const t = useTranslations("dashboard.sidebar")
  const tNavbar = useTranslations("navbar")
  const scale = useZoomScale()
  const { user, isLoggedIn } = useCurrentUser()
  const { mutate: doLogout, isPending: isLoggingOut } = useLogout()
  const [avatarMenuOpen, setAvatarMenuOpen] = React.useState(false)
  const avatarMenuRef = React.useRef<HTMLDivElement>(null)

  // strip locale prefix e.g. /en/dashboard → /dashboard
  const path = "/" + pathname.split("/").slice(2).join("/")

  React.useEffect(() => {
    if (!avatarMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [avatarMenuOpen])

  // compensate: h-screen (100vh) gets scaled down by zoom, so inflate it inversely
  const sidebarHeight = scale > 0 && scale < 1 ? `${100 / scale}vh` : "100vh"

  return (
    <aside
      className="fixed left-0 top-0 z-50 flex w-24 flex-col items-center py-6"
      style={{
        height: sidebarHeight,
        background: "#FAFAFA",
        borderRadius: "0 24px 24px 0",
        borderRight: "1.5px solid #E5E5E5",
        boxShadow: "4px 0 24px 0 rgba(99,102,241,0.13)",
      }}
    >
      {/* Logo */}
      <Link href="/dashboard" className="mb-8 flex items-center justify-center">
        <Image src={LogoIcon} alt="Momenia" className="h-16 w-auto" />
      </Link>

      {/* Nav Items */}
      <nav className="flex flex-1 flex-col items-center gap-2 w-full px-3">
        {navItems.map(({ id, labelKey, icon: Icon, href }) => {
          const isActive =
            href === "/dashboard"
              ? path === "/dashboard" || path === "/dashboard/"
              : path.startsWith(href)

          return (
            <Link
              key={id}
              href={href}
              className="flex w-full flex-col items-center gap-1.5 rounded-xl py-2.5 text-center transition-all hover:bg-white/50"
            >
              {/* Icon box — filled only when active */}
              <div
                className="flex h-12 w-12 items-center justify-center rounded-[14px] transition-all"
                style={isActive ? { background: "#4f46e5" } : undefined}
              >
                <Icon
                  className={cn("h-8 w-8 transition-colors", isActive ? "text-white" : "")}
                  style={isActive ? undefined : { color: "#0a0a0a" }}
                  strokeWidth={1.8}
                />
              </div>
              {/* Label */}
              <span className="text-[10px] font-semibold leading-tight" style={{ color: "#0a0a0a" }}>
                {t(labelKey as "template" | "myInvitation" | "favorite" | "transaction")}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="mt-auto flex flex-col items-center gap-2 pb-3 px-2 w-full">
        {isLoggedIn && user ? (
          <div className="relative w-full flex justify-center" ref={avatarMenuRef}>
            <button
              type="button"
              onClick={() => setAvatarMenuOpen((v) => !v)}
              className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-white transition-all hover:ring-indigo-300"
              title={user.name}
            >
              {user.profilePicture ? (
                <Image src={user.profilePicture} alt={user.name} width={40} height={40} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-xs font-semibold text-indigo-700">
                  {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              )}
            </button>

            {avatarMenuOpen && (
              <div className="absolute bottom-full left-1/2 mb-2 w-44 -translate-x-1/2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
                <div className="border-b border-zinc-100 px-3 py-2.5">
                  <p className="truncate text-xs font-semibold text-zinc-900">{user.name}</p>
                  <p className="truncate text-[10px] text-zinc-400">{user.email}</p>
                </div>
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={() => { setAvatarMenuOpen(false); doLogout() }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Keluar
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link href="/login" className="w-full">
              <button
                type="button"
                className="w-full rounded-xl border border-indigo-200 py-1.5 text-[10px] font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors"
              >
                {tNavbar("login")}
              </button>
            </Link>
            <Link href="/register" className="w-full">
              <button
                type="button"
                className="w-full rounded-xl bg-indigo-600 py-1.5 text-[10px] font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                {tNavbar("signUp")}
              </button>
            </Link>
          </>
        )}
      </div>
    </aside>
  )
}
