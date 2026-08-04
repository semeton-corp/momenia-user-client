"use client"

import { useState, type ComponentType, type CSSProperties } from "react"
import {
  House,
  LayoutDashboard,
  MailOpen,
  MessageSquareText,
  NotebookText,
  PencilLine,
  Users,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { Link, usePathname, useRouter } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { useZoomScale } from "@/hooks/use-zoom-scale"
import { useEditorDirty } from "@/contexts/EditorDirtyContext"
import { UnsavedChangesModal } from "./UnsavedChangesModal"

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
  const router = useRouter()
  const t = useTranslations("dashboard.workspace.sidebar")
  const scale = useZoomScale()
  const basePath = `/dashboard/my-invitation/${invitationId}`
  // Home leaves this invitation's workspace entirely, back to the invitation list —
  // the nav item below it is the one that goes to this invitation's dashboard.
  const myInvitationsPath = "/dashboard/my-invitation"
  const { isDirty } = useEditorDirty()
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (isDirty && href !== pathname) {
      e.preventDefault()
      setPendingHref(href)
    }
  }

  const confirmNavigation = () => {
    if (pendingHref) router.push(pendingHref)
    setPendingHref(null)
  }

  const navItems: NavItem[] = [
    { key: "dashboard", href: basePath,               icon: LayoutDashboard, exact: true },
    { key: "edit",      href: `${basePath}/edit`,     icon: PencilLine },
    { key: "guests",    href: `${basePath}/guests`,   icon: Users },
    { key: "rsvp",      href: `${basePath}/rsvp`,     icon: MailOpen,        dividerAfter: true },
    { key: "notes",     href: `${basePath}/notes`,    icon: NotebookText },
    { key: "messages",  href: `${basePath}/messages`, icon: MessageSquareText },
  ]

  const sidebarHeight = scale > 0 && scale < 1 ? `${100 / scale}vh` : "100vh"

  return (
    <>
      {/* ── Desktop: fixed left sidebar ── */}
      <aside
        className="fixed left-0 top-0 z-40 hidden flex-col items-center py-6 lg:flex"
        style={{
          width: "116px",
          height: sidebarHeight,
          background: "#FAFAFA",
          borderRadius: "0 24px 24px 0",
          borderRight: "1.5px solid #E5E5E5",
        }}
      >
        {/* Home — plain icon, no box */}
        <Link
          href={myInvitationsPath}
          onClick={(e) => handleNavClick(e, myInvitationsPath)}
          className="mt-6 mb-12 flex items-center justify-center transition-all hover:opacity-70"
        >
          <House className="h-8 w-8" style={{ color: "#4F46E5" }} />
        </Link>

        {/* Nav */}
        <nav className="flex w-full flex-1 flex-col items-center gap-1 px-3">
          {navItems.map(({ key, href, icon: Icon, exact, dividerAfter }) => {
            const isActive = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`)

            return (
              <div key={key} className="flex w-full flex-col items-center gap-1">
                <Link
                  href={href}
                  onClick={(e) => handleNavClick(e, href)}
                  className="flex w-full flex-col items-center gap-1 rounded-xl py-1.5 text-center transition-all hover:bg-white/50"
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-[14px] transition-all"
                    style={isActive ? { background: "#4F46E5" } : undefined}
                  >
                    <Icon
                      className={cn("h-8 w-8 transition-colors", isActive ? "text-white" : "")}
                      style={isActive ? undefined : { color: "#0a0a0a" }}
                      strokeWidth={1.8}
                    />
                  </div>
                  <span
                    className="text-xs font-semibold leading-tight"
                    style={{ color: isActive ? "#4F46E5" : "#0a0a0a" }}
                  >
                    {t(key)}
                  </span>
                </Link>
                {dividerAfter && (
                  <div className="w-8" style={{ height: "2px", background: "#A1A1A1", marginTop: "8px", marginBottom: "8px" }} />
                )}
              </div>
            )
          })}
        </nav>
      </aside>

      {/* ── Mobile: fixed bottom bar — proporsi disamakan persis dengan
          DashboardMobileNav (tinggi 90px + padding aman gesture-bar iPhone,
          supaya tidak mepet ke tepi bawah layar). Item pakai flex-1 supaya
          mengisi penuh lebar layar secara proporsional, bukan discroll. ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex h-[90px] items-stretch border-t border-zinc-200 bg-white px-1 lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {navItems.map(({ key, href, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`)

          return (
            <Link
              key={key}
              href={href}
              onClick={(e) => handleNavClick(e, href)}
              className="flex flex-1 flex-col items-center justify-center gap-1.5 transition-all"
            >
              <div
                className="flex items-center justify-center transition-all"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: isActive ? "#4F46E5" : "transparent",
                }}
              >
                <Icon
                  className="transition-colors"
                  style={{ width: "26px", height: "26px", color: isActive ? "white" : "#52525b" }}
                  strokeWidth={1.8}
                />
              </div>
              <span
                className="whitespace-nowrap text-xs font-medium leading-none"
                style={{ color: isActive ? "#4F46E5" : "#71717a" }}
              >
                {t(key)}
              </span>
            </Link>
          )
        })}
      </nav>

      {pendingHref && (
        <UnsavedChangesModal
          onConfirm={confirmNavigation}
          onCancel={() => setPendingHref(null)}
        />
      )}
    </>
  )
}
