"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type BannerFilterOption = {
  value: string
  label: string
}

type BannerFilterDropdownProps = {
  icon: React.ReactNode
  /** Label statis pada tombol (mengikuti desain banner: "Category" / "Sort"). */
  label: string
  /** Judul di dalam panel dropdown, mis. "Kategori". Default ke `label`. */
  title?: string
  value: string
  options: BannerFilterOption[]
  onChange: (value: string) => void
  /** Ukuran responsif trigger (per kontrol), digabung ke class dasar tombol banner. */
  triggerClassName?: string
  /** true = ikon+label dipusatkan sebagai satu grup (dipakai saat tombol melebar
   * penuh, mis. baris mobile). Default: ikon tetap di kiri, label mengisi sisa
   * ruang rata kiri — supaya posisi ikon tetap konsisten walau isi label beda
   * panjang antar dropdown yang berdampingan. */
  centerContent?: boolean
  /** Panel nempel rata kiri atau kanan ke tombolnya. Default "right" — pakai
   * "left" kalau tombolnya ada di sisi kiri layar/baris, supaya panel tidak
   * nyembur ke luar tepi kiri layar (terpotong) di mobile. */
  align?: "left" | "right"
}

export function BannerFilterDropdown({
  icon,
  label,
  title,
  value,
  options,
  onChange,
  triggerClassName,
  centerContent,
  align = "right",
}: BannerFilterDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const displayLabel = options.find((opt) => opt.value === value)?.label ?? label

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
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl border bg-white px-3 text-xs font-medium hover:bg-zinc-50 md:gap-2 md:px-4 md:text-base xl:gap-2 xl:rounded-2xl xl:px-5",
          centerContent && "w-full justify-center",
          triggerClassName,
        )}
        style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <span className="flex shrink-0 items-center">{icon}</span>
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
            className={cn(
              "absolute top-full z-50 mt-2 w-[224px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-lg border border-[#E5E5E5] bg-white text-left shadow-md",
              align === "left" ? "left-0" : "right-0",
            )}
          >
            <p className="px-4 pt-3 pb-2.5 text-base font-semibold text-zinc-900">{title ?? label}</p>
            <div className="border-t border-[#E5E5E5]" />
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
