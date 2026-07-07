"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

export type BannerFilterOption = {
  value: string
  label: string
}

type BannerFilterDropdownProps = {
  icon: React.ReactNode
  /** Label statis pada tombol (mengikuti desain banner: "Category" / "Sort"). */
  label: string
  value: string
  options: BannerFilterOption[]
  onChange: (value: string) => void
  /** Ukuran responsif trigger (per kontrol), digabung ke class dasar tombol banner. */
  triggerClassName?: string
}

export function BannerFilterDropdown({
  icon,
  label,
  value,
  options,
  onChange,
  triggerClassName,
}: BannerFilterDropdownProps) {
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

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-xl bg-white text-xs font-medium hover:bg-zinc-50 md:gap-2 md:text-base xl:gap-2 xl:rounded-2xl xl:border",
          triggerClassName,
        )}
        style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        {icon}
        <span className="min-w-0 truncate">{label}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="listbox"
            className="absolute right-0 top-full z-50 mt-2 max-h-64 min-w-[200px] overflow-auto rounded-xl border border-zinc-200 bg-white py-1.5 text-left shadow-lg"
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
