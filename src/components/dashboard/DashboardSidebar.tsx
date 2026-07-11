"use client"

import * as React from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { TableProperties, Folder, Heart, CircleDollarSign } from "lucide-react"
import { useZoomScale } from "@/hooks/use-zoom-scale"
import LogoIcon from "@/assets/logo/logo-momenia.svg"
import { Link, usePathname } from "@/i18n/navigation"
import { useCurrentUser } from "@/hooks/auth/useCurrentUser"
import { useAuthGate } from "@/components/dashboard/DashboardAuthGate"
import { PROTECTED_DASHBOARD_PATHS } from "@/lib/dashboard-protected-paths"

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
  const { user, isLoggedIn, isLoading } = useCurrentUser()
  const { requestAccess } = useAuthGate()

  // next-intl usePathname already strips locale prefix
  const path = pathname

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
              onClick={(e) => {
                if (PROTECTED_DASHBOARD_PATHS.has(href) && !isLoggedIn) {
                  e.preventDefault()
                  requestAccess()
                }
              }}
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
                  strokeWidth={1.3}
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
        {isLoading ? (
          // Sebelum status auth diketahui (localStorage baru dibaca setelah mount),
          // tampilkan placeholder netral supaya tombol login/signup tidak berkedip
          // muncul sekejap untuk user yang sebenarnya sudah login.
          <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200" />
        ) : isLoggedIn && user ? (
          <Link
            href="/dashboard/profile"
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
          </Link>
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
