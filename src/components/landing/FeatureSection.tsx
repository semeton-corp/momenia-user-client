"use client"

import * as React from "react"
import { PenTool } from "lucide-react"
import { motion } from "framer-motion"
import { useLocale, useTranslations } from "next-intl"
import { FeatureCard } from "./FeatureCard"
import { LandingPageFeature } from "@/lib/api/landing-page/landing-page.types"

const iconClass = "h-5 w-5 md:h-6 md:w-6 text-indigo-600 transition-colors duration-300"

type FeatureItem = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

type PromoTitle = {
  readonly badge: string
  readonly title: string
  readonly subtitle: string
}

type FeatureSectionProps = {
  readonly features?: LandingPageFeature[]
  readonly promoTitle?: PromoTitle
}

export function FeatureSection({ features: apiFeatures, promoTitle }: FeatureSectionProps) {
  // ── Semua hooks dideklarasikan di atas, berurutan ──
  const locale                                = useLocale()
  const [activeCardIndex, setActiveCardIndex] = React.useState<number | null>(0)
  const [zoomLevel, setZoomLevel]             = React.useState(1)
  const [isDesktop, setIsDesktop]             = React.useState(false)
  const scaleWrapperRef                       = React.useRef<HTMLDivElement>(null)

  const t       = useTranslations("landing.features")
  const tCommon = useTranslations("common")

  const featuresData: FeatureItem[] = (apiFeatures ?? []).map((f) => ({
    id: String(f.id),
    title: locale === "id" ? f.titleIdn : f.titleEn,
    description: locale === "id" ? f.descriptionIdn : f.descriptionEn,
    icon: f.icon
      ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={f.icon} alt={locale === "id" ? f.titleIdn : f.titleEn} className="h-5 w-5 object-contain md:h-6 md:w-6" />
        )
      : <PenTool className={iconClass} />,
  }))

  // Detect browser zoom via devicePixelRatio
  React.useEffect(() => {
    const update = () => setZoomLevel(globalThis.devicePixelRatio || 1)
    update()
    globalThis.addEventListener("resize", update)
    return () => globalThis.removeEventListener("resize", update)
  }, [])

  // Detect desktop breakpoint (lg = 1024px+)
  React.useEffect(() => {
    const mq = globalThis.matchMedia("(min-width: 1024px)")
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

  // Kompensasi gap di bawah section akibat scale() transform.
  // scale() mengecilkan visual tapi DOM tetap memakai tinggi asli →
  // marginBottom negatif menutup gap tersebut.
  React.useEffect(() => {
    const el = scaleWrapperRef.current
    if (!el) return
    const naturalHeight  = el.scrollHeight
    const compensation   = (activeScale - 1) * naturalHeight
    el.style.transition  = "margin-bottom 200ms ease-out"
    el.style.marginBottom = `${compensation}px`
  }, [activeScale])

  return (
    <section
      id="features"
      className="mx-auto w-full max-w-400 px-4 pt-2 pb-10 md:px-12 md:pt-4 md:pb-12 lg:pt-6"
      style={{ fontFamily: "var(--font-geist-sans)" }}
      aria-label="Momenia Features"
    >
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
        {/* Container Title */}
        <motion.div
          className="mb-12 flex flex-col items-center text-center md:mb-16"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.65 }}
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: {
              opacity: 1, y: 0,
              transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {promoTitle ? (
            <>
              <span className="mb-2 text-2xl font-semibold uppercase tracking-widest text-[#18181b] md:text-3xl lg:text-4xl">
                {promoTitle.badge}
              </span>
              <h2 className="text-5xl font-semibold tracking-tight text-[#18181b] md:text-7xl lg:text-8xl">
                {promoTitle.title}
              </h2>
              <p className="mt-4 text-base font-normal text-[#18181b] md:whitespace-nowrap md:text-xl">
                {promoTitle.subtitle}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                <span className="text-primary">{tCommon("siteName")}</span> {t("titleSuffix")}
              </h2>
              <p className="mt-4 max-w-2xl text-base font-normal text-muted-foreground md:text-lg">
                {t("subtitle")}
              </p>
            </>
          )}
        </motion.div>

        {/* Grid Layout */}
        <div className={promoTitle ? "blur-sm pointer-events-none select-none" : undefined}>
        <motion.div
          className="mx-auto grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:gap-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.32, delayChildren: 0.1 } },
          }}
        >
          {featuresData.map((feature, index) => {
            const isLastItem = index === featuresData.length - 1 && featuresData.length % 3 !== 0
            return (
              <motion.div
                key={feature.id}
                className={
                  isLastItem
                    ? "flex justify-center sm:col-span-2 sm:col-start-1 lg:col-span-1 lg:col-start-2"
                    : "flex justify-center"
                }
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: {
                    opacity: 1, y: 0,
                    transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                <FeatureCard
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  className="h-full w-full"
                  isExpanded={activeCardIndex === index}
                  onToggle={() => setActiveCardIndex(activeCardIndex === index ? null : index)}
                />
              </motion.div>
            )
          })}
        </motion.div>
        </div>
      </div>
    </section>
  )
}
