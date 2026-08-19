"use client"

import { useState } from "react"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { CalendarDays } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getUserInvitationDetail } from "@/lib/api/user-invitation/user-invitation.service"
import { openInvitationPreview } from "@/lib/invitation-preview"
import { useToast } from "@/providers/ToastProvider"
import type { MyInvitationItem, MyInvitationStatus } from "@/lib/types/invitation-workspace"

const BADGE: Record<MyInvitationStatus, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-amber-100 text-amber-700",
  expired: "bg-red-100 text-red-700",
}

// Outline button that keeps this card's exact resting look (no shadow / no hover
// text-color shift from the default `outline` variant).
const OUTLINE_NEUTRAL =
  "border-[#E5E7EB] bg-white text-[#111827] shadow-none hover:bg-zinc-50 hover:text-[#111827]"
const OUTLINE_PRIMARY =
  "border-primary bg-white text-primary shadow-none hover:bg-primary/5 hover:text-primary"

export function MyInvitationCard({ inv }: { inv: MyInvitationItem }) {
  const t = useTranslations("dashboard.workspace.myInvitations")
  const locale = useLocale()
  const { toast } = useToast()
  const [isOpeningPreview, setIsOpeningPreview] = useState(false)
  const isDraft = inv.status === "draft"
  const dashHref = `/dashboard/my-invitation/${inv.id}`
  const editHref = `/dashboard/my-invitation/${inv.id}/edit`

  // Same handoff the editor's Preview button uses: build the invitation HTML, stash it
  // for /preview, open a tab. The list only carries summary data, so the full template
  // has to be fetched first — kept inside the click so the tab still counts as
  // user-initiated and isn't treated as a popup.
  const handlePreview = async () => {
    if (isOpeningPreview) return
    setIsOpeningPreview(true)
    try {
      const detail = await getUserInvitationDetail(inv.id)
      openInvitationPreview(detail, locale)
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to open preview", "error")
    } finally {
      setIsOpeningPreview(false)
    }
  }

  const statusBadge = (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium xl:text-xs",
        BADGE[inv.status],
      )}
    >
      {t(`status.${inv.status}`)}
    </span>
  )

  return (
    <div className="rounded-[8px] border border-zinc-200 bg-white p-[10px] xl:h-[188px] xl:p-5">
      {/* ── Mobile ── */}
      <div className="xl:hidden">
        <div className="flex gap-3">
          <div className="relative h-[60px] w-[50px] shrink-0 overflow-hidden rounded-lg bg-zinc-100">
            <Image src={inv.thumbnail} alt={inv.title} fill sizes="50px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[15px] font-semibold leading-snug text-[#111111]">{inv.title}</h3>
              {statusBadge}
            </div>
            <p className="mt-1 text-[12px] font-normal text-[#6B7280]">{inv.category}</p>
            <p className="mt-1 text-[12px] font-normal text-[#4B5563]">
              {inv.guests} {t("guests").toLowerCase()} • {inv.rsvp} RSVP
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          {isDraft ? (
            <span className="truncate text-[12px] font-normal text-[#6B7280]">{t("draftHint")}</span>
          ) : inv.slug ? (
            <a
              href={`/${locale}/invitation/${inv.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 truncate text-[12px] font-medium text-primary hover:underline"
            >
              {inv.url}
            </a>
          ) : (
            <span className="truncate text-[12px] font-normal text-[#6B7280]" />
          )}
          {isDraft ? (
            <Button
              asChild
              variant="outline"
              className={cn("h-auto shrink-0 rounded-[6px] px-3 py-1.5 text-[12px] font-medium", OUTLINE_PRIMARY)}
            >
              <Link href={editHref}>{t("continueEdit")}</Link>
            </Button>
          ) : (
            <Button
              asChild
              className="h-auto shrink-0 rounded-[6px] px-3 py-1.5 text-[12px] font-medium text-white"
            >
              <Link href={dashHref}>{t("openDashboard")}</Link>
            </Button>
          )}
        </div>
      </div>

      {/* ── Desktop ── */}
      <div className="hidden h-full items-center gap-6 xl:flex">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-10">
            <h3 className="w-[240px] shrink-0 truncate text-2xl font-semibold text-[#111111]">{inv.title}</h3>
            {statusBadge}
          </div>
          <p className="mt-3 text-base font-normal text-[#485563]">{inv.category}</p>
          <p className="mt-3 text-sm font-normal text-[#6B7280]">{inv.lastActivity}</p>
          {isDraft ? (
            <p className="mt-3 text-sm font-medium text-[#111827]">{t("draftHint")}</p>
          ) : inv.slug ? (
            <a
              href={`/${locale}/invitation/${inv.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block w-full truncate text-sm font-medium text-primary hover:underline"
            >
              {inv.url}
            </a>
          ) : null}
        </div>

        <div className="flex shrink-0 gap-6">
          <div className="flex h-20 w-[154px] flex-col items-center justify-center rounded-lg bg-zinc-50">
            <span className="text-lg font-semibold text-[#111827]">{inv.guests}</span>
            <span className="text-[13px] font-normal text-[#6B7280]">{t("guests")}</span>
          </div>
          <div className="flex h-20 w-[154px] flex-col items-center justify-center rounded-lg bg-zinc-50">
            <span className="text-lg font-semibold text-[#111827]">{inv.rsvp}</span>
            <span className="text-[13px] font-normal text-[#6B7280]">{t("rsvp")}</span>
          </div>
        </div>

        <div className="w-[364px] shrink-0">
          <div className="flex gap-3">
            {isDraft ? (
              <>
                <Button
                  asChild
                  variant="outline"
                  className={cn("h-11 w-[174px] rounded-lg px-4 text-sm font-medium", OUTLINE_PRIMARY)}
                >
                  <Link href={editHref}>{t("continueEdit")}</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  disabled={isOpeningPreview}
                  className={cn("h-11 w-[174px] rounded-lg px-4 text-sm font-medium", OUTLINE_NEUTRAL)}
                >
                  {t("preview")}
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  className="h-11 w-[174px] rounded-lg px-4 text-sm font-medium text-white"
                >
                  <Link href={dashHref}>{t("openDashboard")}</Link>
                </Button>
                <Button
                  variant="outline"
                  className={cn("h-11 w-[174px] rounded-lg px-4 text-sm font-medium", OUTLINE_NEUTRAL)}
                >
                  {t("copyLink")}
                </Button>
              </>
            )}
          </div>
          <p className="mt-2 text-[13px] font-normal text-[#6B7280]">
            {isDraft ? t("helperDraft") : t("helperActive")}
          </p>
          {!isDraft && inv.expiresLabel && (
            <p className="mt-2 flex items-center gap-1.5 text-[13px] font-normal text-[#6B7280]">
              <CalendarDays className="size-4 shrink-0" />
              {t("expiresOn", { date: inv.expiresLabel })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
