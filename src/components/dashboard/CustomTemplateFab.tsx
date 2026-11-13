"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Minus, WandSparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { CustomTemplateForm } from "@/components/custom-template/CustomTemplateForm"

/**
 * Tombol melayang "Custom Template" di dashboard (kanan-bawah) + pop-up form brief ala
 * widget chat. Di mobile posisinya naik di atas bottom-nav (h-90px); di desktop (xl:) mepet
 * pojok kanan-bawah. Isi formnya sama dengan section landing, dikirim lewat WhatsApp.
 */
export function CustomTemplateFab() {
  const t = useTranslations("customTemplate")
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={t("fab.panelTitle")}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-[106px] right-3 z-40 flex max-h-[calc(100dvh-130px)] w-[calc(100vw-24px)] max-w-[380px] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl xl:bottom-6 xl:right-6 xl:max-h-[calc(100dvh-48px)]"
          >
            <div className="flex shrink-0 items-center justify-between bg-primary px-5 py-3.5 text-primary-foreground">
              <p className="text-sm font-semibold">{t("fab.panelTitle")}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("fab.minimize")}
                className="cursor-pointer rounded-md p-1 transition-colors hover:bg-white/15"
              >
                <Minus className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-5">
              <CustomTemplateForm onSubmitted={() => setOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher diganti panel saat terbuka (seperti widget chat), kembali lagi saat di-minimize. */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-[106px] right-3 z-40 inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-indigo-500/30 transition-colors hover:bg-primary/90 xl:bottom-6 xl:right-6"
        >
          <WandSparkles className="h-4 w-4" />
          {t("fab.label")}
        </button>
      )}
    </>
  )
}
