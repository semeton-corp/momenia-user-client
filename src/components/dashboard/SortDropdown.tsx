"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type SortDropdownOption = {
  value: string
  label: string
}

type SortDropdownProps = {
  value: string
  options: SortDropdownOption[]
  onChange: (value: string) => void
  className?: string
  /** Judul di dalam panel dropdown, mis. "Sort by". */
  title?: string
}

export function SortDropdown({ value, options, onChange, className, title }: SortDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const selected = options.find((opt) => opt.value === value)

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-full w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-[#E5E7EB] bg-white pl-4 pr-3 text-sm font-medium text-[#111827] outline-none transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-indigo-200 xl:text-base"
      >
        <span className="truncate">{selected?.label}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        </motion.span>
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
            {title && (
              <>
                <p className="px-4 pt-3 pb-2.5 text-base font-semibold text-zinc-900">{title}</p>
                <div className="border-t border-[#E5E5E5]" />
              </>
            )}
            <ul role="listbox" className="py-1.5">
              {options.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <li key={opt.value} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(opt.value)
                        setOpen(false)
                      }}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors",
                        isSelected ? "bg-zinc-100 font-medium text-zinc-900" : "text-zinc-700 hover:bg-zinc-50",
                      )}
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                        {isSelected && <Check className="h-4 w-4 text-zinc-900" />}
                      </span>
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
