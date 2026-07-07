"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"

const PAGE_SIZE_OPTIONS = [10, 25, 50]

type RowsPerPageSelectProps = {
  value?: number
  onChange?: (value: number) => void
}

function RowsPerPageSelect({ value, onChange }: RowsPerPageSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(10)
  const currentValue = value ?? internalValue
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSelect = (opt: number) => {
    if (onChange) onChange(opt)
    else setInternalValue(opt)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 transition-colors"
      >
        {currentValue}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown className="h-3 w-3 text-zinc-400" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full left-0 z-50 mb-1.5 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg"
          >
            {PAGE_SIZE_OPTIONS.map((opt) => (
              <li
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`cursor-pointer px-4 py-2 text-xs transition-colors ${
                  opt === currentValue
                    ? "bg-indigo-500 text-white"
                    : "text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {opt}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

type PaginationButtonsProps = {
  canGoPrev?: boolean
  canGoNext?: boolean
  onFirstPage?: () => void
  onPrevPage?: () => void
  onNextPage?: () => void
}

// "Lompat ke halaman terakhir" tidak didukung — API pakai cursor-based
// pagination (hanya bisa maju berdasarkan nextCursor), bukan nomor halaman.
function PaginationButtons({ canGoPrev, canGoNext, onFirstPage, onPrevPage, onNextPage }: PaginationButtonsProps) {
  const prevDisabled = onPrevPage ? !canGoPrev : false
  const nextDisabled = onNextPage ? !canGoNext : false

  return (
    <div className="flex items-center gap-1 text-zinc-400">
      <button
        type="button"
        disabled={prevDisabled}
        onClick={onFirstPage}
        className="rounded-lg border border-zinc-200 p-1.5 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <ChevronsLeft className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        disabled={prevDisabled}
        onClick={onPrevPage}
        className="rounded-lg border border-zinc-200 p-1.5 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        disabled={nextDisabled}
        onClick={onNextPage}
        className="rounded-lg border border-zinc-200 p-1.5 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        disabled
        title="Belum didukung"
        className="rounded-lg border border-zinc-200 p-1.5 opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronsRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

type WorkspaceTableFooterProps = {
  selectionLabel: string
  rowsPerPageLabel: string
  pageLabel: string
  bordered?: boolean
  /** Kontrol opsional — kalau tidak diberikan, footer tetap dekoratif seperti semula. */
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  canGoPrev?: boolean
  canGoNext?: boolean
  onFirstPage?: () => void
  onPrevPage?: () => void
  onNextPage?: () => void
}

export function WorkspaceTableFooter({
  selectionLabel,
  rowsPerPageLabel,
  pageLabel,
  bordered = true,
  pageSize,
  onPageSizeChange,
  canGoPrev,
  canGoNext,
  onFirstPage,
  onPrevPage,
  onNextPage,
}: WorkspaceTableFooterProps) {
  const paginationProps = { canGoPrev, canGoNext, onFirstPage, onPrevPage, onNextPage }

  return (
    <div className={cn("px-4 py-4 text-xs text-zinc-500 sm:px-6", bordered && "border-t border-zinc-100")}>

      {/* Mobile: 2-row layout */}
      <div className="flex flex-col gap-2 lg:hidden">
        <div className="flex items-center justify-between">
          <span>{rowsPerPageLabel}</span>
          <span className="font-medium text-zinc-700">{pageLabel}</span>
        </div>
        <div className="flex items-center justify-between">
          <RowsPerPageSelect value={pageSize} onChange={onPageSizeChange} />
          <PaginationButtons {...paginationProps} />
        </div>
      </div>

      {/* Desktop: single-row layout */}
      <div className="hidden lg:flex lg:items-center lg:justify-between">
        <span className="text-sm font-normal text-muted-foreground">{selectionLabel}</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{rowsPerPageLabel}</span>
            <RowsPerPageSelect value={pageSize} onChange={onPageSizeChange} />
          </div>
          <span className="text-sm font-medium text-foreground">{pageLabel}</span>
          <PaginationButtons {...paginationProps} />
        </div>
      </div>

    </div>
  )
}
