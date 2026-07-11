"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { TransactionTable } from "@/components/dashboard/transaction/TransactionTable"
import { TransactionTableSkeleton } from "@/components/dashboard/transaction/TransactionTableSkeleton"
import { useOrders } from "@/hooks/useOrders"
import type { Order } from "@/lib/api/order/order.types"
import type { TransactionRecord, TransactionStatus } from "@/lib/types/transaction"

function normalizeStatus(order: Order): TransactionStatus {
  const s = (order.paymentStatus || order.orderStatus || "").toLowerCase()
  if (["paid", "success", "completed", "settlement", "capture"].includes(s)) return "completed"
  if (["failed", "cancelled", "canceled", "expired", "deny", "denied"].includes(s)) return "failed"
  return "pending"
}

// API mengirim timestamp gaya Go, mis. "2026-06-18 22:08:32.861282 +0700 +07"
// (offset ditulis dua kali) — ambil tanggal/jam + offset pertama saja, sisanya diabaikan.
function formatOrderTime(raw: string): string {
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(?:\.\d+)?\s*([+-]\d{2}:?\d{2})?/)
  if (!match) return raw
  const [, datePart, timePart, offsetRaw] = match
  const offset = offsetRaw ? offsetRaw.replace(/^([+-]\d{2})(\d{2})$/, "$1:$2") : "Z"
  const date = new Date(`${datePart}T${timePart}${offset}`)
  if (Number.isNaN(date.getTime())) return raw
  return `${date.toLocaleTimeString("en-GB")} · ${date.toLocaleDateString("en-US")}`
}

function mapOrderToTransaction(order: Order): TransactionRecord {
  const templateItem = order.orderItems.find((i) => i.itemType === "template")
  const title = templateItem?.productName ?? order.orderItems[0]?.productName ?? order.orderNumber

  return {
    id: order.orderNumber,
    title,
    totalPrice: parseFloat(order.totalPrice),
    status: normalizeStatus(order),
    timeLabel: formatOrderTime(order.createdAt),
    items:
      order.orderItems.length > 1
        ? order.orderItems.map((item) => ({
            name: item.productName,
            kind: item.itemType === "template" || item.itemType === "duration" ? item.itemType : "addon",
            price: parseFloat(item.price),
          }))
        : [],
  }
}

const DEFAULT_PAGE_SIZE = 10

export default function TransactionPage() {
  const t = useTranslations("dashboard.transaction")
  const tc = useTranslations("dashboard.workspace.common")
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE)
  // Cursor bertumpuk: index N = cursor untuk mengambil halaman N+2 (halaman 1 tidak butuh cursor).
  const [cursorStack, setCursorStack] = React.useState<string[]>([])
  const currentCursor = cursorStack.at(-1)
  const currentPage = cursorStack.length + 1

  const { data, isLoading, isError } = useOrders({ pageSize, cursor: currentCursor })

  const rows = (data?.data ?? []).map(mapOrderToTransaction)
  const totalData = data?.totalData ?? 0
  const totalPage = data?.totalPage ?? 1

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCursorStack([])
  }

  const statusText: Record<TransactionStatus, string> = {
    completed: t("status.completed"),
    pending: t("status.pending"),
    failed: t("status.failed"),
  }

  return (
    <div className="px-5 pt-2 md:px-8 xl:mx-auto xl:max-w-[1824px] xl:px-16 xl:pb-10 xl:pt-[72px]">
      {/* ── Header ── */}
      <header className="space-y-1.5 xl:space-y-3">
        <h1 className="text-[28px] font-semibold text-[#111111] xl:text-[48px] xl:leading-[48px]">
          {t("title")}
        </h1>
        <p className="text-sm font-normal text-zinc-500 xl:text-lg xl:font-normal">{t("subtitle")}</p>
      </header>

      {/* ── Table ── */}
      <div className="mt-6 xl:mt-8">
        {isLoading ? (
          <TransactionTableSkeleton rows={pageSize} />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 py-20 text-center">
            <p className="text-sm text-zinc-400">{t("loadError")}</p>
          </div>
        ) : (
          <TransactionTable
            rows={rows}
            idLabel={t("table.id")}
            itemLabel={t("table.item")}
            totalPriceLabel={t("table.totalPrice")}
            statusLabel={t("table.status")}
            timeLabel={t("table.time")}
            statusText={statusText}
            templateLabel={t("template")}
            durationLabel={t("duration")}
            addonLabel={t("addon")}
            itemsIncludedLabel={(count) => t("itemsIncluded", { count })}
            viewDetailsLabel={t("viewDetails")}
            hideDetailsLabel={t("hideDetails")}
            emptyLabel={t("empty")}
            selectionLabel={tc("selectedRows", { count: 0, total: totalData })}
            rowsPerPageLabel={tc("rowsPerPage")}
            pageLabel={tc("pageLabel", { current: currentPage, total: totalPage })}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            canGoPrev={cursorStack.length > 0}
            canGoNext={!!data?.nextCursor && currentPage < totalPage}
            onFirstPage={() => setCursorStack([])}
            onPrevPage={() => setCursorStack((prev) => prev.slice(0, -1))}
            onNextPage={() => {
              if (data?.nextCursor) setCursorStack((prev) => [...prev, data.nextCursor])
            }}
          />
        )}
      </div>
    </div>
  )
}
