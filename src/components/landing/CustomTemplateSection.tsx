"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Instagram } from "lucide-react"
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/social"
import { useTranslations } from "next-intl"
import TemplateWall from "@/assets/llandingpage/template-wall.png"
import { CustomTemplateForm } from "@/components/custom-template/CustomTemplateForm"

/**
 * Section "Custom Template" di landing — background dinding template penuh selebar
 * section (rata, tanpa kartu/rounded), teks di kiri-bawah, form brief di kanan yang
 * dikirim lewat WhatsApp. Id "custom-template" dipakai tombol "Request Template" di navbar.
 */
export function CustomTemplateSection() {
  const t = useTranslations("customTemplate")

  return (
    <section
      id="custom-template"
      aria-label={t("title")}
      className="relative isolate w-full overflow-hidden bg-white"
    >
      {/* Gambar jadi background di belakang teks + form (form menimpa gambar). Mobile/tablet:
          dibatasi di bagian atas section lalu pudar ke putih; desktop (lg+): mengisi seluruh
          section, rata penuh tepi ke tepi. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] md:h-[560px] lg:inset-y-0 lg:h-auto"
      >
        <Image src={TemplateWall} alt="" fill sizes="100vw" className="object-cover object-top" />
        {/* Pudar ke putih di belakang teks (atas di mobile, kiri di desktop) dan di tepi bawah. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.9)_38%,rgba(255,255,255,0)_90%),linear-gradient(to_top,#fff_0%,rgba(255,255,255,0)_20%)] lg:bg-[linear-gradient(to_right,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.92)_48%,rgba(255,255,255,0.5)_58%,rgba(255,255,255,0)_70%),linear-gradient(to_top,#fff_0%,rgba(255,255,255,0)_30%)]" />
      </div>

      <div
        className="mx-auto grid w-full max-w-[1240px] gap-8 px-4 py-8 md:gap-10 md:px-12 md:py-14 lg:min-h-[640px] lg:grid-cols-[1fr_minmax(0,460px)] lg:items-start lg:gap-12 lg:py-20 xl:gap-16"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        <motion.div
          className="flex max-w-xl flex-col gap-3"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl lg:text-4xl xl:text-5xl">
            {t("title")} <span className="block text-primary">{t("titleHighlight")}</span>
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-slate-700 md:text-base">{t("subtitle")}</p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t("instagram")} ${INSTAGRAM_HANDLE}`}
            className="mt-1 inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80 md:text-base"
          >
            <Instagram className="h-5 w-5 shrink-0" />
            <span>{INSTAGRAM_HANDLE}</span>
          </a>
        </motion.div>

        <motion.div
          className="rounded-[20px] border border-zinc-100 bg-white p-5 shadow-[0_24px_60px_-12px_rgba(79,70,229,0.35)] md:p-7"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          <CustomTemplateForm />
        </motion.div>
      </div>
    </section>
  )
}
