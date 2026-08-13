"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Globe } from "lucide-react"
import { useLocale } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { ProfileActionRow } from "./ProfileActionRow"

const localeNames: Record<(typeof routing.locales)[number], string> = {
  id: "Indonesia",
  en: "English",
}

// Switch bahasa memakai pola yang sama dengan Navbar: <Link href={pathname} locale={loc}>
// dari next-intl navigation — pindah locale tanpa kehilangan halaman saat ini.
// Panel dropdown-nya meniru gaya SortDropdown di dashboard (judul + checkmark),
// tapi lebarnya mengikuti lebar baris (full-width).
export function ProfileLanguageRow({ label, title }: { label: string; title?: string }) {
  const locale = useLocale()
  const pathname = usePathname()
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
    <div ref={ref} className="relative">
      <ProfileActionRow
        icon={Globe}
        label={label}
        value={localeNames[locale as keyof typeof localeNames]}
        onClick={() => setOpen((o) => !o)}
        ariaExpanded={open}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-[#E5E5E5] bg-white text-left shadow-md"
          >
            {title && (
              <>
                <p className="px-4 pt-3 pb-2.5 text-base font-semibold text-zinc-900">{title}</p>
                <div className="border-t border-[#E5E5E5]" />
              </>
            )}
            <ul className="py-1.5">
              {routing.locales.map((loc) => {
                const isSelected = locale === loc
                return (
                  <li key={loc}>
                    <Link
                      href={pathname}
                      locale={loc}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors",
                        isSelected ? "bg-zinc-100 font-medium text-zinc-900" : "text-zinc-700 hover:bg-zinc-50",
                      )}
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                        {isSelected && <Check className="h-4 w-4 text-zinc-900" />}
                      </span>
                      <span className="truncate">{localeNames[loc]}</span>
                    </Link>
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
