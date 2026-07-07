"use client"

import { useTranslations } from "next-intl"
import { TableProperties, Folder, Heart, CircleDollarSign } from "lucide-react"
import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { useAuthGate } from "@/components/dashboard/DashboardAuthGate"
import { useCurrentUser } from "@/hooks/auth/useCurrentUser"
import { PROTECTED_DASHBOARD_PATHS } from "@/lib/dashboard-protected-paths"

const navItems = [
  { id: "template",      labelKey: "template",      icon: TableProperties,  href: "/dashboard" },
  { id: "my-invitation", labelKey: "myInvitation",  icon: Folder,           href: "/dashboard/my-invitation" },
  { id: "favourite",     labelKey: "favorite",      icon: Heart,            href: "/dashboard/favourite" },
  { id: "transaction",   labelKey: "transaction",   icon: CircleDollarSign, href: "/dashboard/transaction" },
] as const

export function DashboardMobileNav() {
  const pathname = usePathname()
  const t = useTranslations("dashboard.sidebar")
  const { isLoggedIn } = useCurrentUser()
  const { requestAccess } = useAuthGate()
  // next-intl usePathname already strips locale prefix
  const path = pathname

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex h-[90px] items-stretch border-t border-zinc-200 bg-white px-1 xl:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
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
            className="flex flex-1 flex-col items-center justify-center gap-1.5"
          >
            <div
              className="flex items-center justify-center transition-all"
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: isActive ? "var(--sidebar-primary)" : "transparent",
              }}
            >
              <Icon
                className={cn("transition-colors", isActive ? "text-white" : "text-foreground")}
                style={{ width: "26px", height: "26px" }}
                strokeWidth={1.8}
              />
            </div>
            <span
              className={cn(
                "text-xs font-medium leading-none transition-colors",
                isActive ? "text-primary" : "text-foreground"
              )}
            >
              {t(labelKey as "template" | "myInvitation" | "favorite" | "transaction")}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
