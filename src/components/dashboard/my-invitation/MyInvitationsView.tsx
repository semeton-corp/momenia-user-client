"use client"

import * as React from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Search } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { MY_INVITATIONS } from "@/lib/mocks/my-invitations"
import type { MyInvitationItem, MyInvitationStatus } from "@/lib/types/invitation-workspace"

type Tab = "all" | MyInvitationStatus

const DOT: Record<Tab, string> = {
  all: "#18181b",
  published: "#22c55e",
  draft: "#f59e0b",
  expired: "#ef4444",
}

const BADGE: Record<MyInvitationStatus, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-amber-100 text-amber-700",
  expired: "bg-red-100 text-red-700",
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

export function MyInvitationsView() {
  const t = useTranslations("dashboard.workspace.myInvitations")
  const [tab, setTab] = React.useState<Tab>("all")
  const [search, setSearch] = React.useState("")

  const counts = {
    total: MY_INVITATIONS.length,
    published: MY_INVITATIONS.filter((i) => i.status === "published").length,
    draft: MY_INVITATIONS.filter((i) => i.status === "draft").length,
    expired: MY_INVITATIONS.filter((i) => i.status === "expired").length,
  }

  const q = search.trim().toLowerCase()
  const filtered = MY_INVITATIONS.filter((i) => {
    const okTab = tab === "all" || i.status === tab
    const okSearch = !q || i.title.toLowerCase().includes(q)
    return okTab && okSearch
  })

  return (
    <div className="px-5 pb-10 pt-6 md:px-8 xl:px-16 xl:pt-[72px]">
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
        <StatCard color={DOT.all} value={counts.total} label={t("stat.total")} short={t("stat.totalShort")} desc={t("stat.totalDesc")} />
        <StatCard color={DOT.published} value={counts.published} label={t("stat.published")} short={t("stat.published")} desc={t("stat.publishedDesc")} />
        <StatCard color={DOT.draft} value={counts.draft} label={t("stat.draft")} short={t("stat.draft")} desc={t("stat.draftDesc")} />
        <StatCard color={DOT.expired} value={counts.expired} label={t("stat.expired")} short={t("stat.expired")} desc={t("stat.expiredDesc")} />
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
        {filtered.map((inv) => (
          <InvitationCard key={inv.id} inv={inv} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-200 py-16 text-center text-sm text-zinc-400">
            {t("empty")}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  color,
  value,
  label,
  short,
  desc,
}: {
  color: string
  value: number
  label: string
  short: string
  desc: string
}) {
  return (
    <div className="rounded-[8px] border border-zinc-200 bg-white p-[10px] xl:px-6 xl:py-[22px]">
      <div className="flex items-center gap-1 xl:gap-3">
        <span className="h-[5px] w-[5px] shrink-0 rounded-full xl:h-2.5 xl:w-2.5" style={{ background: color }} />
        <span className="text-[22px] font-semibold text-card-foreground xl:text-[32px] xl:leading-10">{value}</span>
      </div>
      <p className="mt-1 truncate text-[12px] font-normal text-[#6B7280] xl:mt-2 xl:text-base xl:font-normal xl:text-zinc-700">
        <span className="xl:hidden">{short}</span>
        <span className="hidden xl:inline">{label}</span>
      </p>
      <p className="mt-0.5 hidden text-xs text-zinc-400 xl:mt-2 xl:block xl:text-sm xl:font-normal">{desc}</p>
    </div>
  )
}

function InvitationCard({ inv }: { inv: MyInvitationItem }) {
  const t = useTranslations("dashboard.workspace.myInvitations")
  const isDraft = inv.status === "draft"
  const dashHref = `/dashboard/my-invitation/${inv.id}`
  const editHref = `/dashboard/my-invitation/${inv.id}/edit`

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
              <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium", BADGE[inv.status])}>
                {t(`status.${inv.status}`)}
              </span>
            </div>
            <p className="mt-1 text-[12px] font-normal text-[#6B7280]">
              {inv.category} • {inv.eventDate}
            </p>
            <p className="mt-1 text-[12px] font-normal text-[#4B5563]">
              {inv.guests} {t("guests").toLowerCase()} • {inv.rsvp} RSVP
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="truncate text-[12px] font-normal text-[#6B7280]">{isDraft ? t("draftHint") : inv.url}</span>
          {isDraft ? (
            <Link
              href={editHref}
              className="shrink-0 rounded-[6px] border border-primary px-3 py-1.5 text-[12px] font-medium text-primary"
            >
              {t("continueEdit")}
            </Link>
          ) : (
            <Link
              href={dashHref}
              className="shrink-0 rounded-[6px] bg-primary px-3 py-1.5 text-[12px] font-medium text-white"
            >
              {t("openDashboard")}
            </Link>
          )}
        </div>
      </div>

      {/* ── Desktop ── */}
      <div className="hidden h-full items-center gap-6 xl:flex">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-40">
            <h3 className="truncate text-2xl font-semibold text-[#111111]">{inv.title}</h3>
            <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", BADGE[inv.status])}>
              {t(`status.${inv.status}`)}
            </span>
          </div>
          <p className="mt-3 text-base font-normal text-[#485563]">
            {inv.category} • {inv.eventDate}
          </p>
          <p className="mt-3 text-sm font-normal text-[#6B7280]">{inv.lastActivity}</p>
          <p className="mt-3 text-sm font-medium text-[#111827]">{isDraft ? t("draftHint") : inv.url}</p>
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
                <Link
                  href={editHref}
                  className="flex h-11 w-[174px] cursor-pointer items-center justify-center rounded-lg border border-primary bg-white px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                >
                  {t("continueEdit")}
                </Link>
                <button
                  type="button"
                  className="flex h-11 w-[174px] cursor-pointer items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition-colors hover:bg-zinc-50"
                >
                  {t("preview")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href={dashHref}
                  className="flex h-11 w-[174px] cursor-pointer items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  {t("openDashboard")}
                </Link>
                <button
                  type="button"
                  className="flex h-11 w-[174px] cursor-pointer items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition-colors hover:bg-zinc-50"
                >
                  {t("copyLink")}
                </button>
              </>
            )}
          </div>
          <p className="mt-2 text-[13px] font-normal text-[#6B7280]">{isDraft ? t("helperDraft") : t("helperActive")}</p>
        </div>
      </div>
    </div>
  )
}
