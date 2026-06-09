"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

const PAGE_SIZE_OPTIONS = [10, 25, 50]

function RowsPerPageSelect() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(10)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 transition-colors"
      >
        {value}
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
                onClick={() => { setValue(opt); setOpen(false) }}
                className={`cursor-pointer px-4 py-2 text-xs transition-colors ${
                  opt === value
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

type WorkspaceTableFooterProps = {
  selectionLabel: string
  rowsPerPageLabel: string
  pageLabel: string
}

export function WorkspaceTableFooter({
  selectionLabel,
  rowsPerPageLabel,
  pageLabel,
}: WorkspaceTableFooterProps) {
  return (
    <div className="border-t border-zinc-100 px-4 py-4 text-xs text-zinc-500 sm:px-6">

      {/* Mobile: 2-row layout */}
      <div className="flex flex-col gap-2 lg:hidden">
        <div className="flex items-center justify-between">
          <span>{rowsPerPageLabel}</span>
          <span className="font-medium text-zinc-700">{pageLabel}</span>
        </div>
        <div className="flex items-center justify-between">
          <RowsPerPageSelect />
          <div className="flex items-center gap-1 text-zinc-400">
            <button className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-50 transition-colors">
              <ChevronsLeft className="h-3.5 w-3.5" />
            </button>
            <button className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-50 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-50 transition-colors">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-50 transition-colors">
              <ChevronsRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop: single-row layout */}
      <div className="hidden lg:flex lg:items-center lg:justify-between">
        <span>{selectionLabel}</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>{rowsPerPageLabel}</span>
            <RowsPerPageSelect />
          </div>
          <span className="font-medium text-zinc-700">{pageLabel}</span>
          <div className="flex items-center gap-1 text-zinc-400">
            <button className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-50 transition-colors">
              <ChevronsLeft className="h-3.5 w-3.5" />
            </button>
            <button className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-50 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-50 transition-colors">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-50 transition-colors">
              <ChevronsRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
