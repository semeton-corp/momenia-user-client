"use client"

import * as React from "react"
import Image from "next/image"
import { Ban, CheckCircle2, ChevronRight, Clock, Timer, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TransactionRecord, TransactionStatus } from "@/lib/types/transaction"
import { WorkspaceBadge } from "@/components/dashboard/invitation/WorkspaceBadge"
import { WorkspaceTableFooter } from "@/components/dashboard/invitation/WorkspaceTableFooter"
import EmptyTransactionIllustration from "@/assets/empty-states/empty-transaction.svg"

const STATUS_TONE: Record<TransactionStatus, "green" | "amber" | "red" | "neutral"> = {
  pending: "amber",
  success: "green",
  expired: "neutral",
  failed: "red",
  deny: "red",
}

const STATUS_ICON: Record<TransactionStatus, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  success: CheckCircle2,
  expired: Timer,
  failed: XCircle,
  deny: Ban,
}

function formatIDR(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`
}

type TransactionTableProps = {
  rows: TransactionRecord[]
  idLabel: string
  itemLabel: string
  totalPriceLabel: string
  statusLabel: string
  timeLabel: string
  dateLabel: string
  statusText: Record<TransactionStatus, string>
  templateLabel: string
  durationLabel: string
  addonLabel: string
  itemsIncludedLabel: (count: number) => string
  viewDetailsLabel: string
  hideDetailsLabel: string
  emptyTitle: string
  emptySubtitle: string
  rowsPerPageLabel: string
  pageLabel: string
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  canGoPrev?: boolean
  canGoNext?: boolean
  onFirstPage?: () => void
  onPrevPage?: () => void
  onNextPage?: () => void
  lastPageUnsupportedLabel?: string
}

export function TransactionTable({
  rows,
  idLabel,
  itemLabel,
  totalPriceLabel,
  statusLabel,
  timeLabel,
  dateLabel,
  statusText,
  templateLabel,
  durationLabel,
  addonLabel,
  itemsIncludedLabel,
  viewDetailsLabel,
  hideDetailsLabel,
  emptyTitle,
  emptySubtitle,
  rowsPerPageLabel,
  pageLabel,
  pageSize,
  onPageSizeChange,
  canGoPrev,
  canGoNext,
  onFirstPage,
  onPrevPage,
  onNextPage,
  lastPageUnsupportedLabel,
}: TransactionTableProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const kindLabel = (kind: TransactionRecord["items"][number]["kind"]) => {
    if (kind === "template") return templateLabel
    if (kind === "duration") return durationLabel
    return addonLabel
  }

  const subtitleOf = (row: TransactionRecord) =>
    row.items.length > 0 ? itemsIncludedLabel(row.items.length) : templateLabel

  const StatusBadge = ({ status }: { status: TransactionStatus }) => {
    const Icon = STATUS_ICON[status]
    return (
      <WorkspaceBadge tone={STATUS_TONE[status]} className="gap-1">
        <Icon className="h-3.5 w-3.5" />
        {statusText[status]}
      </WorkspaceBadge>
    )
  }

  const LineItems = ({ row }: { row: TransactionRecord }) => (
    <div className="space-y-3">
      {row.items.map((item, i) => (
        <div key={`${row.id}-${i}`}>
          <p className="text-sm font-medium text-foreground">{item.name}</p>
          <p className="mt-0.5 text-xs text-zinc-400">
            {kindLabel(item.kind)} · {formatIDR(item.price)}
          </p>
        </div>
      ))}
    </div>
  )

  return (
    <>
      {/* ── Table (bisa digeser horizontal di layar sempit) ── */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className={cn("w-full border-separate border-spacing-0 text-left text-sm", rows.length > 0 && "min-w-[780px]")}>
            <thead>
              <tr className="bg-indigo-50 text-sm font-medium text-foreground">
                <th className="px-6 py-3">{idLabel}</th>
                <th className="px-4 py-3">{itemLabel}</th>
                <th className="px-6 py-3 whitespace-nowrap">{totalPriceLabel}</th>
                <th className="px-6 py-3 whitespace-nowrap">{statusLabel}</th>
                <th className="px-6 py-3 whitespace-nowrap">{timeLabel}</th>
                <th className="px-6 py-3 whitespace-nowrap">{dateLabel}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10">
                    <div className="mx-auto flex w-full max-w-[448px] flex-col items-center gap-6 text-center">
                      <Image
                        src={EmptyTransactionIllustration}
                        alt=""
                        className="h-[151px] w-[188px] xl:h-auto xl:w-64"
                        priority
                      />
                      <div className="flex flex-col gap-3">
                        <h2 className="text-lg font-semibold text-gray-950 xl:text-2xl">{emptyTitle}</h2>
                        <p className="text-xs font-normal text-muted-foreground xl:text-base">{emptySubtitle}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {rows.map((row) => {
                const canExpand = row.items.length > 0
                const isOpen = expanded.has(row.id)
                return (
                  <React.Fragment key={row.id}>
                    <tr className="transition-colors hover:bg-zinc-50/60">
                      <td className={cn("border-zinc-100 px-6 py-4", !isOpen && "border-b")}>
                        <div className="flex items-center gap-2">
                          {canExpand ? (
                            <button
                              type="button"
                              aria-label={isOpen ? hideDetailsLabel : viewDetailsLabel}
                              onClick={() => toggle(row.id)}
                              className="cursor-pointer text-zinc-400 transition-colors hover:text-zinc-600"
                            >
                              <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
                            </button>
                          ) : (
                            <span className="w-4" />
                          )}
                          <span className="whitespace-nowrap text-sm font-medium text-foreground">{row.id}</span>
                        </div>
                      </td>
                      <td className={cn("border-zinc-100 px-4 py-4", !isOpen && "border-b")}>
                        <p className="text-sm font-medium text-zinc-900">{row.title}</p>
                        <p className="mt-0.5 text-xs text-zinc-400">{subtitleOf(row)}</p>
                      </td>
                      <td className={cn("border-zinc-100 px-6 py-4 whitespace-nowrap text-sm font-normal text-foreground", !isOpen && "border-b")}>
                        {formatIDR(row.totalPrice)}
                      </td>
                      <td className={cn("border-zinc-100 px-6 py-4", !isOpen && "border-b")}>
                        <StatusBadge status={row.status} />
                      </td>
                      <td className={cn("border-zinc-100 px-6 py-4 whitespace-nowrap text-sm font-normal text-zinc-500", !isOpen && "border-b")}>
                        {row.timeLabel}
                      </td>
                      <td className={cn("border-zinc-100 px-6 py-4 whitespace-nowrap text-sm font-normal text-zinc-500", !isOpen && "border-b")}>
                        {row.dateLabel}
                      </td>
                    </tr>

                    {canExpand && isOpen && (
                      <tr>
                        <td className="border-b border-zinc-100" />
                        <td className="border-b border-zinc-100 px-4 py-4" colSpan={5}>
                          {/* border-l di div (bukan di td) supaya tingginya ngikutin
                              konten aslinya (tidak nyentuh sampai bawah td), dan
                              px-4 di td ini sejajar dengan px-4 header "Item" di
                              atasnya, jadi garisnya sejajar sama huruf "I". */}
                          <div className="border-l border-zinc-200 pl-4">
                            <LineItems row={row} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Footer di luar container tabel — cuma tampil kalau ada data ── */}
      {rows.length > 0 && (
      <div className="mt-3">
        <WorkspaceTableFooter
          bordered={false}
          rowsPerPageLabel={rowsPerPageLabel}
          pageLabel={pageLabel}
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          onFirstPage={onFirstPage}
          onPrevPage={onPrevPage}
          onNextPage={onNextPage}
          lastPageUnsupportedLabel={lastPageUnsupportedLabel}
        />
      </div>
      )}
    </>
  )
}
