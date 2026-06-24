"use client"

import * as React from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { TableProperties, Folder, Heart, CircleDollarSign, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useZoomScale } from "@/hooks/use-zoom-scale"
import LogoIcon from "@/assets/logo/logo-momenia.svg"
import { Link, usePathname } from "@/i18n/navigation"
import { useCurrentUser } from "@/hooks/auth/useCurrentUser"
import { useLogout } from "@/hooks/auth/useLogout"

const navItems = [
  { id: "template",      labelKey: "template",      icon: TableProperties,  href: "/dashboard" },
  { id: "my-invitation", labelKey: "myInvitation",  icon: Folder,           href: "/dashboard/my-invitation" },
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

  // next-intl usePathname already strips locale prefix
  const path = pathname

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
      className="fixed left-0 top-0 z-50 hidden flex-col xl:flex"
      style={{
        width: "116px",
        height: sidebarHeight,
        background: "#FAFAFA",
        borderRadius: "0 24px 24px 0",
        borderRight: "1.5px solid #E5E5E5",
        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        paddingTop: "48px",
        paddingBottom: "42px",
        paddingLeft: "16px",
        paddingRight: "16px",
      }}
    >
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center justify-center" style={{ marginBottom: "46px" }}>
        <Image src={LogoIcon} alt="Momenia" style={{ width: "45px", height: "61.15px" }} />
      </Link>

      {/* Nav Items */}
      <nav className="flex flex-1 flex-col items-center w-full" style={{ gap: "28px" }}>
        {navItems.map(({ id, labelKey, icon: Icon, href }) => {
          const isActive =
            href === "/dashboard"
              ? path === "/dashboard" || path === "/dashboard/"
              : path.startsWith(href)

          return (
            <Link
              key={id}
              href={href}
              className="flex w-full flex-col items-center text-center transition-all"
              style={{ gap: "4px" }}
            >
              {/* Icon box */}
              <div
                className="flex items-center justify-center transition-all"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  background: isActive ? "var(--sidebar-primary)" : "transparent",
                  padding: "4px",
                }}
              >
                <Icon
                  className="transition-colors"
                  style={{
                    width: "40px",
                    height: "40px",
                    color: isActive ? "#ffffff" : "var(--foreground)",
                  }}
                  strokeWidth={1.8}
                />
              </div>
              {/* Label */}
              <span
                className="font-medium leading-4"
                style={{ fontSize: "12px", color: "var(--foreground)" }}
              >
                {t(labelKey as "template" | "myInvitation" | "favorite" | "transaction")}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="mt-auto flex flex-col items-center w-full">
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
          <div className="flex flex-col" style={{ gap: "16px" }}>
            <Link href="/login">
              <button
                type="button"
                className="cursor-pointer transition-opacity hover:opacity-90"
                style={{
                  width: "84px",
                  height: "44px",
                  borderRadius: "8px",
                  background: "var(--primary)",
                  border: "1px solid #e5e5e5",
                  padding: "12px",
                  fontSize: "14px",
                  fontWeight: 500,
                  lineHeight: "20px",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {tNavbar("login")}
              </button>
            </Link>
            <Link href="/register">
              <button
                type="button"
                className="cursor-pointer transition-opacity hover:opacity-90"
                style={{
                  width: "84px",
                  height: "44px",
                  borderRadius: "8px",
                  background: "transparent",
                  border: "1px solid var(--primary)",
                  padding: "12px",
                  fontSize: "14px",
                  fontWeight: 500,
                  lineHeight: "20px",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {tNavbar("signUp")}
              </button>
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
