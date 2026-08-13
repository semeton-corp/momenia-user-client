"use client"

import * as React from "react"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { Search } from "lucide-react"
import { cn, formatLabel, parseGoTimestamp } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { MyInvitationStatCard } from "@/components/dashboard/my-invitation/MyInvitationStatCard"
import { MyInvitationStatCardSkeleton } from "@/components/dashboard/my-invitation/MyInvitationStatCardSkeleton"
import { MyInvitationCard } from "@/components/dashboard/my-invitation/MyInvitationCard"
import { MyInvitationCardSkeleton } from "@/components/dashboard/my-invitation/MyInvitationCardSkeleton"
import { useUserInvitationOverview, useUserInvitations } from "@/hooks/useUserInvitations"
import type { UserInvitation } from "@/lib/api/user-invitation/user-invitation.types"
import type { MyInvitationItem, MyInvitationStatus } from "@/lib/types/invitation-workspace"
import EmptyFolderIllustration from "@/assets/empty-states/empty-folder.svg"

type Tab = "all" | MyInvitationStatus

const DOT: Record<Tab, string> = {
  all: "#18181b",
  published: "#22c55e",
  draft: "#f59e0b",
  expired: "#ef4444",
}

const CHIP_ACTIVE: Record<Tab, string> = {
  all: "bg-zinc-900 text-white",
  published: "bg-green-500 text-white",
  draft: "bg-amber-500 text-white",
  expired: "bg-red-500 text-white",
}

const CHIP_INACTIVE: Record<Tab, string> = {
  all: "bg-[#f3f4f6] text-[#111827]",
  published: "bg-green-100 text-green-700",
  draft: "bg-amber-100 text-amber-700",
  expired: "bg-red-100 text-red-700",
}

const TABS: Tab[] = ["all", "published", "draft", "expired"]

// Teks empty-state beda per tab: "all" pakai pesan "belum bikin undangan sama sekali",
// tab lain pakai pesan spesifik statusnya.
const EMPTY_KEYS: Record<Tab, { title: string; subtitle: string }> = {
  all: { title: "emptyTitle", subtitle: "emptySubtitle" },
  published: { title: "emptyPublishedTitle", subtitle: "emptyPublishedSubtitle" },
  draft: { title: "emptyDraftTitle", subtitle: "emptyDraftSubtitle" },
  expired: { title: "emptyExpiredTitle", subtitle: "emptyExpiredSubtitle" },
}

const FALLBACK_THUMBNAIL = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=200&q=80"

function mapToMyInvitationItem(inv: UserInvitation, locale: string, lastUpdatedLabel: (date: string) => string): MyInvitationItem {
  const dateLocale = locale === "id" ? "id-ID" : "en-US"
  const expiredAt = parseGoTimestamp(inv.expiredAt ?? "")
  const expiresLabel = expiredAt
    ? expiredAt.toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" })
    : ""

  return {
    id: inv.id,
    title: inv.name || "Untitled",
    category: inv.category?.name ? formatLabel(inv.category.name) : "",
    expiresLabel,
    status: inv.status,
    lastActivity: inv.lastUpdatedAt ? lastUpdatedLabel(inv.lastUpdatedAt) : "",
    url: inv.slug ? `momenia.com/${inv.slug}` : null,
    slug: inv.slug || null,
    guests: inv.totalGuest ?? 0,
    rsvp: inv.totalRSVP ?? 0,
    thumbnail: FALLBACK_THUMBNAIL,
  }
}

export default function MyInvitationPage() {
  const t = useTranslations("dashboard.workspace.myInvitations")
  const locale = useLocale()
  const [tab, setTab] = React.useState<Tab>("all")
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const { data: overview, isLoading: isOverviewLoading } = useUserInvitationOverview()
  const { data: invitations = [], isLoading, isError } = useUserInvitations(
    tab === "all"
      ? { keyword: debouncedSearch || undefined }
      : { statuses: [tab], keyword: debouncedSearch || undefined },
  )

  const counts = {
    total: overview?.totalInvitation ?? 0,
    published: overview?.totalPublishedInvitation ?? 0,
    draft: overview?.totalDraftInvitation ?? 0,
    expired: overview?.totalExpiredInvitation ?? 0,
  }

  const lastUpdatedLabel = (date: string) =>
    t("lastUpdated", {
      date: new Date(date).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    })

  const items = invitations.map((inv) => mapToMyInvitationItem(inv, locale, lastUpdatedLabel))

  return (
    <div className="px-5 pt-2 md:px-8 xl:mx-auto xl:max-w-[1824px] xl:px-16 xl:pb-10 xl:pt-[72px]">
      {/* ── Header ── */}
      <header className="space-y-1.5 xl:space-y-3">
        <h1 className="text-[28px] font-semibold text-[#111111] xl:text-[48px] xl:leading-[48px]">
          {t("title")}
        </h1>
        <p className="hidden text-base text-zinc-500 xl:block xl:text-lg xl:font-normal">{t("subtitle")}</p>
        <p className="text-sm font-normal text-zinc-500 xl:hidden">{t("subtitleShort")}</p>
      </header>

      {/* ── Mobile search (above stats) ── */}
      <div className="relative mt-[14px] xl:hidden">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search")}
          className="h-12 w-full rounded-lg border border-zinc-200 bg-white pl-12 pr-4 text-sm text-zinc-700 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* ── Stats ── */}
      <div className="mt-[14px] grid grid-cols-4 gap-2.5 xl:mt-8 xl:gap-4">
        {isOverviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => <MyInvitationStatCardSkeleton key={i} />)
        ) : (
          <>
            <MyInvitationStatCard color={DOT.all} value={counts.total} label={t("stat.total")} short={t("stat.totalShort")} desc={t("stat.totalDesc")} />
            <MyInvitationStatCard color={DOT.published} value={counts.published} label={t("stat.published")} short={t("stat.published")} desc={t("stat.publishedDesc")} />
            <MyInvitationStatCard color={DOT.draft} value={counts.draft} label={t("stat.draft")} short={t("stat.draft")} desc={t("stat.draftDesc")} />
            <MyInvitationStatCard color={DOT.expired} value={counts.expired} label={t("stat.expired")} short={t("stat.expired")} desc={t("stat.expiredDesc")} />
          </>
        )}
      </div>

      {/* ── Tabs + desktop search ── */}
      <div className="mt-[14px] flex items-center justify-between gap-4 xl:mt-8">
        {/* Desktop: segmented control */}
        <div className="hidden h-11 w-[480px] items-center justify-between rounded-lg bg-[#f3f4f6] p-1 xl:flex">
          {TABS.map((tk) => (
            <button
              key={tk}
              type="button"
              onClick={() => setTab(tk)}
              className={cn(
                "flex h-9 w-[104px] cursor-pointer items-center justify-center rounded-md text-sm font-medium transition-colors",
                tab === tk ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700",
              )}
            >
              {t(`tab.${tk}`)}
            </button>
          ))}
        </div>

        {/* Mobile: colored chips */}
        <div className="flex w-full gap-2 overflow-x-auto pb-0.5 scrollbar-hide xl:hidden">
          {TABS.map((tk) => (
            <button
              key={tk}
              type="button"
              onClick={() => setTab(tk)}
              className={cn(
                "shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                tab === tk ? CHIP_ACTIVE[tk] : CHIP_INACTIVE[tk],
              )}
            >
              {t(`tab.${tk}`)}
            </button>
          ))}
        </div>

        {/* Desktop: search */}
        <div className="hidden shrink-0 xl:block xl:w-[456px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
            className="h-[56px] w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-base font-normal text-zinc-700 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      {/* ── List ── */}
      <div className="mt-[14px] space-y-4 xl:mt-8">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <MyInvitationCardSkeleton key={i} />)
        ) : isError ? (
          <div className="rounded-2xl border border-zinc-200 py-16 text-center text-sm text-zinc-400">
            {t("loadError")}
          </div>
        ) : items.length === 0 && debouncedSearch.trim() ? (
          <div className="rounded-2xl border border-zinc-200 py-16 text-center text-sm text-zinc-400">
            {t("empty")}
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto flex w-full max-w-[448px] flex-col items-center gap-6 py-10 text-center">
            <Image src={EmptyFolderIllustration} alt="" className="h-[151px] w-[188px] xl:h-auto xl:w-64" priority />
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-gray-950 xl:text-2xl">{t(EMPTY_KEYS[tab].title)}</h2>
              <p className="text-xs font-normal text-muted-foreground xl:text-base">{t(EMPTY_KEYS[tab].subtitle)}</p>
            </div>
            {tab === "all" && (
              <Button asChild className="h-12 rounded-xl px-6 text-sm font-medium xl:font-semibold">
                <Link href="/dashboard">{t("browseTemplates")}</Link>
              </Button>
            )}
          </div>
        ) : (
          items.map((inv) => <MyInvitationCard key={inv.id} inv={inv} />)
        )}
      </div>
    </div>
  )
}
