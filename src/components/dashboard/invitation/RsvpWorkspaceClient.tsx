"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { useRsvpOverview, useRsvps } from "@/hooks/useRsvps"
import { DonutChart } from "./DonutChart"
import { RsvpGuestTable } from "./RsvpGuestTable"
import { RsvpGuestTableSkeleton } from "./RsvpGuestTableSkeleton"
import { RsvpStatsSkeleton } from "./RsvpStatsSkeleton"
import { SummaryStatCard } from "./SummaryStatCard"
import { WorkspaceCard } from "./WorkspaceCard"

const INDIGO_DEEP = "#1F1B74"
const DEFAULT_PAGE_SIZE = 10

type Props = {
  invitationId: string
}

export function RsvpWorkspaceClient({ invitationId }: Props) {
  const t = useTranslations("dashboard.workspace")

  const [keyword, setKeyword] = React.useState("")
  const [debouncedKeyword, setDebouncedKeyword] = React.useState("")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE)
  const [cursor, setCursor] = React.useState<string | undefined>(undefined)
  const [cursorHistory, setCursorHistory] = React.useState<string[]>([])

  // Debounce supaya tidak fetch di setiap ketikan
  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedKeyword(keyword), 350)
    return () => clearTimeout(id)
  }, [keyword])

  // Balik ke halaman pertama tiap kali filter/urutan berubah
  React.useEffect(() => {
    setCursor(undefined)
    setCursorHistory([])
  }, [debouncedKeyword, pageSize, sortOrder])

  const { data: overview, isLoading: isOverviewLoading } = useRsvpOverview(invitationId)
  const { data: rsvpList, isLoading: isListLoading } = useRsvps(invitationId, {
    pageSize,
    cursor,
    keyword: debouncedKeyword || undefined,
    sortField: "name",
    sortOrder,
  })

  const stats = {
    totalGuests: overview?.totalGuest ?? 0,
    attending: overview?.totalGuestPresent ?? 0,
    declined: overview?.totalGuestAbsent ?? 0,
    pending: overview?.totalGuestNotConfirmed ?? 0,
  }

  const guests = rsvpList?.data ?? []
  const totalData = rsvpList?.totalData ?? 0
  const totalPage = rsvpList?.totalPage ?? 1
  const currentPage = cursorHistory.length + 1

  const handleNextPage = () => {
    if (!rsvpList?.nextCursor) return
    setCursorHistory((prev) => [...prev, cursor ?? ""])
    setCursor(rsvpList.nextCursor)
  }

  const handlePrevPage = () => {
    setCursorHistory((prev) => {
      const next = [...prev]
      const last = next.pop()
      setCursor(last || undefined)
      return next
    })
  }

  const handleFirstPage = () => {
    setCursor(undefined)
    setCursorHistory([])
  }

  return (
    <>
      {isOverviewLoading ? (
        <RsvpStatsSkeleton />
      ) : (
        <>
          {/* ── Mobile stats layout ── */}
          <div className="flex flex-col gap-5 xl:hidden">

            {/* Total Tamu card */}
            <WorkspaceCard className="p-4 text-center">
              <p className="text-sm text-zinc-500">{t("rsvp.totalGuests")}</p>
              <p className="mt-1 text-4xl font-semibold text-zinc-950">{stats.totalGuests}</p>
            </WorkspaceCard>

            {/* Statistik Tamu */}
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm font-medium text-zinc-500">{t("overview.guestStatsTitle")}</p>

              <DonutChart
                sizeClassName="h-52 w-52"
                segments={[
                  { value: stats.attending, color: "#4338CA" },
                  { value: stats.declined,  color: "#818CF8" },
                  { value: stats.pending,   color: "#C7D2FE" },
                ]}
              />

              <div className="grid w-full grid-cols-3 gap-2">
                {[
                  { value: stats.attending, label: t("common.attending"), color: "#4338CA" },
                  { value: stats.declined,  label: t("common.declined"),  color: "#818CF8" },
                  { value: stats.pending,   label: t("common.pending"),   color: "#C7D2FE" },
                ].map(({ value, label, color }) => (
                  <div key={label} className="flex flex-col items-center text-center">
                    <p className="text-2xl font-semibold leading-none" style={{ color: INDIGO_DEEP }}>{value}</p>
                    <div className="my-1.5 h-0.5 w-8 rounded-full" style={{ background: color }} />
                    <p className="text-xs text-zinc-700">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Desktop stats layout ── */}
          <WorkspaceCard className="hidden p-6 xl:block">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:gap-8">
              <div className="flex shrink-0 justify-center xl:justify-start">
                <DonutChart
                  sizeClassName="h-52 w-52"
                  segments={[
                    { value: stats.attending, color: "#4338CA" },
                    { value: stats.declined,  color: "#818CF8" },
                    { value: stats.pending,   color: "#C7D2FE" },
                  ]}
                />
              </div>

              <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryStatCard label={t("rsvp.totalGuests")} value={stats.totalGuests} />
                <SummaryStatCard label={t("common.attending")} value={stats.attending} markerColor="#4338CA" />
                <SummaryStatCard label={t("common.declined")}  value={stats.declined}  markerColor="#818CF8" />
                <SummaryStatCard label={t("common.pending")}   value={stats.pending}   markerColor="#C7D2FE" />
              </div>
            </div>
          </WorkspaceCard>
        </>
      )}

      {/* Guest table — edge-to-edge on mobile */}
      <div className="-mx-4 sm:-mx-6 xl:mx-0">
        {isListLoading ? (
          <RsvpGuestTableSkeleton />
        ) : (
          <RsvpGuestTable
            title={t("rsvp.listTitle")}
            searchPlaceholder={t("common.searchGuests")}
            sortLabel={t("common.sort")}
            nameLabel={t("guests.table.name")}
            whatsAppLabel={t("guests.table.whatsApp")}
            emailLabel={t("guests.table.email")}
            categoryLabel={t("guests.table.category")}
            attendanceLabel={t("rsvp.table.attendance")}
            guestCountLabel={t("rsvp.table.guestCount")}
            presentLabel={t("common.attending")}
            absentLabel={t("common.declined")}
            notConfirmedLabel={t("common.pending")}
            selectionLabel={t("common.selectedRows", { count: 0, total: totalData })}
            rowsPerPageLabel={t("common.rowsPerPage")}
            pageLabel={t("common.pageLabel", { current: currentPage, total: totalPage })}
            guests={guests}
            searchValue={keyword}
            onSearchChange={setKeyword}
            onSortToggle={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            canGoPrev={cursorHistory.length > 0}
            canGoNext={!!rsvpList?.nextCursor}
            onFirstPage={handleFirstPage}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
          />
        )}
      </div>
    </>
  )
}
