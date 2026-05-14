"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { LayoutGrid, FolderOpen, Heart, CircleDollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import { useZoomScale } from "@/hooks/use-zoom-scale"
import LogoIcon from "@/assets/logo/logo-momenia.svg"

const navItems = [
  { id: "template",      labelKey: "template",      icon: LayoutGrid,       href: "/dashboard" },
  { id: "my-invitation", labelKey: "myInvitation",  icon: FolderOpen,       href: "/dashboard/my-invitation" },
  { id: "favourite",     labelKey: "favorite",      icon: Heart,            href: "/dashboard/favourite" },
  { id: "transaction",   labelKey: "transaction",   icon: CircleDollarSign, href: "/dashboard/transaction" },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const t = useTranslations("dashboard.sidebar")
  const scale = useZoomScale()
  // strip locale prefix e.g. /en/dashboard → /dashboard
  const path = "/" + pathname.split("/").slice(2).join("/")

  // compensate: h-screen (100vh) gets scaled down by zoom, so inflate it inversely
  const sidebarHeight = scale > 0 && scale < 1 ? `${100 / scale}vh` : "100vh"

  return (
    <aside
      className="fixed left-0 top-0 z-50 flex w-24 flex-col items-center py-6"
      style={{
        height: sidebarHeight,
        background: "#E8EAFF",
        borderRadius: "0 24px 24px 0",
        borderRight: "1.5px solid #A5B4FC",
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

      {/* User Avatar */}
      <div className="mt-auto flex flex-col items-center gap-3 pb-2">
        <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-white">
          <div className="flex h-full w-full items-center justify-center bg-zinc-300 text-xs font-semibold text-zinc-600">
            U
          </div>
        </div>
      </div>
    </aside>
  )
}
