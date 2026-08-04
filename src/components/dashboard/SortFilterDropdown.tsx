"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowDown, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

export type SortFilterOption = {
  value: string
  label: string
}

type SortFilterDropdownProps = {
  /** Label statis pada tombol (mis. "Sort"), dipakai juga sebagai judul panel default. */
  label: string
  /** Judul di dalam panel dropdown, mis. "Sortir berdasarkan". Default ke `label`. */
  title?: string
  fieldValue: string
  fieldOptions: SortFilterOption[]
  onFieldChange: (value: string) => void
  orderValue: string
  orderOptions: SortFilterOption[]
  onOrderChange: (value: string) => void
  triggerClassName?: string
  centerContent?: boolean
}

export function SortFilterDropdown({
  label,
  title,
  fieldValue,
  fieldOptions,
  onFieldChange,
  orderValue,
  orderOptions,
  onOrderChange,
  triggerClassName,
  centerContent,
}: SortFilterDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const displayLabel = fieldOptions.find((opt) => opt.value === fieldValue)?.label ?? label

  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={ref} className={cn("relative", centerContent ? "flex-1" : "shrink-0")}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className={cn(
          "flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl border bg-white px-3 text-xs font-medium hover:bg-zinc-50 md:gap-2 md:px-4 md:text-base xl:gap-2 xl:rounded-2xl xl:px-5",
          centerContent && "w-full justify-center",
          triggerClassName,
        )}
        style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <span className="flex shrink-0 items-center">
          {orderValue === "asc" ? (
            <ArrowUp className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
          ) : (
            <ArrowDown className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
          )}
        </span>
        <span className={cn("truncate", centerContent ? "flex-none" : "min-w-0 flex-1 text-left")}>
          {displayLabel}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full z-50 mt-2 w-[224px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-lg border border-[#E5E5E5] bg-white text-left shadow-md"
          >
            <p className="px-4 pt-3 pb-2.5 text-base font-semibold text-zinc-900">{title ?? label}</p>
            <div className="border-t border-[#E5E5E5]" />

            {/* Field: pilihan tunggal bergaya radio */}
            <ul role="radiogroup" className="py-1.5">
              {fieldOptions.map((opt) => {
                const isSelected = opt.value === fieldValue
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => onFieldChange(opt.value)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors",
                        isSelected ? "bg-zinc-100 font-medium text-zinc-900" : "text-zinc-700 hover:bg-zinc-50",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                          isSelected ? "border-primary" : "border-zinc-300",
                        )}
                      >
                        {isSelected && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </span>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="border-t border-[#E5E5E5]" />

            {/* Order: naik/turun, ditutup begitu dipilih */}
            <ul className="py-1.5">
              {orderOptions.map((opt) => {
                const isSelected = opt.value === orderValue
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onOrderChange(opt.value)
                        setOpen(false)
                      }}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors",
                        isSelected ? "bg-zinc-100 font-medium text-zinc-900" : "text-zinc-700 hover:bg-zinc-50",
                      )}
                    >
                      {opt.value === "asc" ? (
                        <ArrowUp className="h-4 w-4 shrink-0" />
                      ) : (
                        <ArrowDown className="h-4 w-4 shrink-0" />
                      )}
                      <span className="truncate">{opt.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
