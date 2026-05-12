"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { FaqAccordion, type FaqItem } from "@/components/landing/FaqAccordion"
import { LandingPageFaq } from "@/lib/api/landing-page/landing-page.types"

type FaqSectionProps = {
  readonly faqs?: LandingPageFaq[]
  readonly locale?: string
}

export function FaqSection({ faqs: apiFaqs, locale = "en" }: FaqSectionProps) {
  // ── Semua hooks dideklarasikan di atas, berurutan ──
  const [zoomLevel, setZoomLevel] = React.useState(1)
  const [isDesktop, setIsDesktop] = React.useState(false)
  const scaleWrapperRef           = React.useRef<HTMLDivElement>(null)

  const t       = useTranslations("landing.faq")
  const tCommon = useTranslations("common")

  // Detect browser zoom via devicePixelRatio
  React.useEffect(() => {
    const update = () => setZoomLevel(globalThis.devicePixelRatio || 1)
    update()
    globalThis.addEventListener("resize", update)
    return () => globalThis.removeEventListener("resize", update)
  }, [])

  // Detect desktop breakpoint (lg = 1024px+)
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // Hitung scale — HANYA aktif di desktop:
  // 100% → 1.00 | 110% → 0.93 | 125% → 0.86 | 150% → 0.75
  const zoomScale = React.useMemo(() => {
    const z        = Number.isFinite(zoomLevel) ? zoomLevel : 1
    const clamped  = Math.min(1.5, Math.max(1, z))
    const progress = (clamped - 1) / 0.5
    const scale    = 1 - progress * 0.25
    return Math.round(scale * 1000) / 1000
  }, [zoomLevel])

  const activeScale = isDesktop ? zoomScale : 1

  // Kompensasi gap di bawah section akibat scale() transform
  React.useEffect(() => {
    const el = scaleWrapperRef.current
    if (!el) return
    const naturalHeight   = el.scrollHeight
    const compensation    = (activeScale - 1) * naturalHeight
    el.style.transition   = "margin-bottom 200ms ease-out"
    el.style.marginBottom = `${compensation}px`
  }, [activeScale])

  const faqItems: FaqItem[] = (apiFaqs ?? []).map((f) => ({
    id: String(f.id),
    question: locale === "id" ? f.question_idn : f.question_en,
    answer:   locale === "id" ? f.answer_idn   : f.answer_en,
  }))

  return (
    <section id="faq" className="w-full" aria-label="FAQ">
      {/* Wrapper yang di-scale — hanya di desktop, smooth saat zoom */}
      <div
        ref={scaleWrapperRef}
        style={{
          transform:       `scale(${activeScale})`,
          transformOrigin: "top center",
          transition:      "transform 200ms ease-out",
          willChange:      "transform",
        }}
      >
        <div
          className="mx-auto w-full max-w-[1600px] px-4 py-10 md:px-12 md:py-14 lg:py-16"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          <motion.div
            className="mx-auto flex max-w-3xl flex-col items-center text-center"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
            variants={{
              hidden: { opacity: 0, y: 14 },
              show: { opacity: 1, y: 0, transition: { duration: 1.55, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              {t("titlePrefix")} <span className="text-primary">{tCommon("siteName")}</span>
            </h2>
            <p className="mt-3 text-sm font-normal text-muted-foreground md:mt-4 md:text-base lg:text-lg">
              {t("subtitle")}
            </p>
          </motion.div>

          <motion.div
            className="mx-auto mt-10 w-full max-w-5xl md:mt-12"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0, transition: { duration: 1.65, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            <FaqAccordion items={faqItems} defaultOpenId="faq-1" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}