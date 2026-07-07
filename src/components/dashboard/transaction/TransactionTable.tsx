"use client"

import * as React from "react"
import { CheckCircle2, ChevronRight, Clock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TransactionRecord, TransactionStatus } from "@/lib/types/transaction"
import { WorkspaceBadge } from "@/components/dashboard/invitation/WorkspaceBadge"
import { WorkspaceTableFooter } from "@/components/dashboard/invitation/WorkspaceTableFooter"

const STATUS_TONE: Record<TransactionStatus, "green" | "amber" | "red"> = {
  completed: "green",
  pending: "amber",
  failed: "red",
}

const STATUS_ICON: Record<TransactionStatus, React.ComponentType<{ className?: string }>> = {
  completed: CheckCircle2,
  pending: Clock,
  failed: XCircle,
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
  statusText: Record<TransactionStatus, string>
  templateLabel: string
  durationLabel: string
  addonLabel: string
  itemsIncludedLabel: (count: number) => string
  viewDetailsLabel: string
  hideDetailsLabel: string
  emptyLabel: string
  selectionLabel: string
  rowsPerPageLabel: string
  pageLabel: string
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  canGoPrev?: boolean
  canGoNext?: boolean
  onFirstPage?: () => void
  onPrevPage?: () => void
  onNextPage?: () => void
}

export function TransactionTable({
  rows,
  idLabel,
  itemLabel,
  totalPriceLabel,
  statusLabel,
  timeLabel,
  statusText,
  templateLabel,
  durationLabel,
  addonLabel,
  itemsIncludedLabel,
  viewDetailsLabel,
  hideDetailsLabel,
  emptyLabel,
  selectionLabel,
  rowsPerPageLabel,
  pageLabel,
  pageSize,
  onPageSizeChange,
  canGoPrev,
  canGoNext,
  onFirstPage,
  onPrevPage,
  onNextPage,
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

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 py-20 text-center">
        <p className="text-base text-zinc-400">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <>
      {/* ── Table (bisa digeser horizontal di layar sempit) ── */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="bg-indigo-50 text-sm font-medium text-foreground">
                <th className="px-6 py-3">{idLabel}</th>
                <th className="w-1/2 px-4 py-3">{itemLabel}</th>
                <th className="px-4 py-3 whitespace-nowrap">{totalPriceLabel}</th>
                <th className="px-4 py-3 whitespace-nowrap">{statusLabel}</th>
                <th className="px-4 py-3 whitespace-nowrap">{timeLabel}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const canExpand = row.items.length > 0
                const isOpen = expanded.has(row.id)
                return (
                  <React.Fragment key={row.id}>
                    <tr className="transition-colors hover:bg-zinc-50/60">
                      <td className="border-b border-zinc-100 px-6 py-4">
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
                      <td className="border-b border-zinc-100 px-4 py-4">
                        <p className="text-sm font-medium text-zinc-900">{row.title}</p>
                        <p className="mt-0.5 text-xs text-zinc-400">{subtitleOf(row)}</p>
                      </td>
                      <td className="border-b border-zinc-100 px-4 py-4 whitespace-nowrap text-sm font-normal text-foreground">
                        {formatIDR(row.totalPrice)}
                      </td>
                      <td className="border-b border-zinc-100 px-4 py-4">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="border-b border-zinc-100 px-4 py-4 whitespace-nowrap text-sm font-normal text-zinc-500">
                        {row.timeLabel}
                      </td>
                    </tr>

                    {canExpand && isOpen && (
                      <tr>
                        <td className="border-b border-zinc-100" />
                        <td className="border-b border-zinc-100 px-4 pb-4" colSpan={4}>
                          <LineItems row={row} />
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

      {/* ── Footer di luar container tabel ── */}
      <div className="mt-3">
        <WorkspaceTableFooter
          bordered={false}
          selectionLabel={selectionLabel}
          rowsPerPageLabel={rowsPerPageLabel}
          pageLabel={pageLabel}
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          onFirstPage={onFirstPage}
          onPrevPage={onPrevPage}
          onNextPage={onNextPage}
        />
      </div>
    </>
  )
}
