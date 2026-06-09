"use client"

import type { ComponentType, CSSProperties } from "react"
import {
  Blocks,
  Gift,
  House,
  LayoutDashboard,
  Mail,
  MessageSquareText,
  NotebookText,
  PencilLine,
  UsersRound,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { useZoomScale } from "@/hooks/use-zoom-scale"

type InvitationWorkspaceSidebarProps = {
  readonly invitationId: string
}

type NavItem = {
  key: string
  href: string
  icon: ComponentType<{ className?: string; strokeWidth?: number; style?: CSSProperties }>
  exact?: boolean
  dividerAfter?: boolean
}

export function InvitationWorkspaceSidebar({ invitationId }: InvitationWorkspaceSidebarProps) {
  const pathname = usePathname()
  const t = useTranslations("dashboard.workspace.sidebar")
  const scale = useZoomScale()
  const basePath = `/dashboard/my-invitation/${invitationId}`

  const navItems: NavItem[] = [
    { key: "dashboard", href: basePath,               icon: LayoutDashboard, exact: true },
    { key: "edit",      href: `${basePath}/edit`,     icon: PencilLine },
    { key: "guests",    href: `${basePath}/guests`,   icon: UsersRound },
    { key: "rsvp",      href: `${basePath}/rsvp`,     icon: Mail,            dividerAfter: true },
    { key: "notes",     href: `${basePath}/notes`,    icon: NotebookText },
    { key: "messages",  href: `${basePath}/messages`, icon: MessageSquareText },
    { key: "gifts",     href: `${basePath}/gifts`,    icon: Gift,            dividerAfter: true },
    { key: "addOns",    href: `${basePath}/add-ons`,  icon: Blocks },
  ]

  const sidebarHeight = scale > 0 && scale < 1 ? `${100 / scale}vh` : "100vh"

  return (
    <>
      {/* ── Desktop: fixed left sidebar ── */}
      <aside
        className="fixed left-0 top-0 z-40 hidden w-24 flex-col items-center py-6 lg:flex"
        style={{
          height: sidebarHeight,
          background: "#FAFAFA",
          borderRadius: "0 24px 24px 0",
          borderRight: "1.5px solid #E5E5E5",
          boxShadow: "4px 0 24px 0 rgba(99,102,241,0.13)",
        }}
      >
        {/* Home — plain icon, no box */}
        <Link
          href={basePath}
          className="mb-6 flex items-center justify-center transition-all hover:opacity-70"
        >
          <House className="h-8 w-8" style={{ color: "#4F46E5" }} />
        </Link>

        {/* Nav */}
        <nav className="flex w-full flex-1 flex-col items-center gap-2 px-3">
          {navItems.map(({ key, href, icon: Icon, exact, dividerAfter }) => {
            const isActive = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`)

            return (
              <div key={key} className="flex w-full flex-col items-center gap-2">
                <Link
                  href={href}
                  className="flex w-full flex-col items-center gap-1.5 rounded-xl py-2 text-center transition-all hover:bg-white/50"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-[14px] transition-all"
                    style={isActive ? { background: "#4F46E5" } : undefined}
                  >
                    <Icon
                      className={cn("h-6 w-6 transition-colors", isActive ? "text-white" : "")}
                      style={isActive ? undefined : { color: "#0a0a0a" }}
                      strokeWidth={1.8}
                    />
                  </div>
                  <span
                    className="text-[10px] font-semibold leading-tight"
                    style={{ color: isActive ? "#4F46E5" : "#0a0a0a" }}
                  >
                    {t(key)}
                  </span>
                </Link>
                {dividerAfter && (
                  <div className="h-px w-8" style={{ background: "#E5E5E5" }} />
                )}
              </div>
            )
          })}
        </nav>
      </aside>

      {/* ── Mobile: fixed bottom bar (scrollable, bigger items) ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
        style={{
          background: "#FAFAFA",
          borderTop: "1.5px solid #E5E5E5",
          height: "72px",
        }}
      >
        <div
          className="flex h-full items-center gap-1 overflow-x-auto px-2"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as CSSProperties}
        >
          {navItems.map(({ key, href, icon: Icon, exact }) => {
            const isActive = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`)

            return (
              <Link
                key={key}
                href={href}
                className="flex shrink-0 flex-col items-center justify-center gap-1 px-3 py-2 transition-all"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-[14px] transition-all"
                  style={isActive ? { background: "#4F46E5" } : undefined}
                >
                  <Icon
                    className="h-5 w-5 transition-colors"
                    style={{ color: isActive ? "white" : "#52525b" }}
                    strokeWidth={1.8}
                  />
                </div>
                <span
                  className="whitespace-nowrap text-[10px] font-semibold leading-none"
                  style={{ color: isActive ? "#4F46E5" : "#71717a" }}
                >
                  {t(key)}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
