"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
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
}

export function SortDropdown({ value, options, onChange, className }: SortDropdownProps) {
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
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="listbox"
            className="absolute right-0 top-full z-50 mt-2 w-full min-w-max overflow-hidden rounded-xl border border-zinc-200 bg-white py-1.5 shadow-lg"
          >
            {options.map((opt) => (
              <li key={opt.value} role="option" aria-selected={opt.value === value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                  className={cn(
                    "block w-full cursor-pointer px-4 py-2.5 text-left text-sm transition-colors",
                    opt.value === value
                      ? "bg-accent/50 font-medium text-primary"
                      : "text-zinc-700 hover:bg-zinc-50",
                  )}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
