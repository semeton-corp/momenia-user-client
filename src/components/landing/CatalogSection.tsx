"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import MobileDarkCatalogSVG from "@/assets/llandingpage/Mobile-dark-catalog.svg"
import { LandingPageCatalog } from "@/lib/api/landing-page/landing-page.types"

type TemplateBadge = "new" | "choice"

type Template = {
  id: string | number
  title: string
  image: string
  badge?: TemplateBadge
}

const DUMMY_CATALOGS: Template[] = [
  {
    id: "dummy-1",
    title: "Ethereal Wedding",
    image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=438&q=80",
    badge: "new",
  },
  {
    id: "dummy-2",
    title: "Garden Romance",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=438&q=80",
    badge: "choice",
  },
  {
    id: "dummy-3",
    title: "Minimalist Chic",
    image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=438&q=80",
    badge: "new",
  },
  {
    id: "dummy-4",
    title: "Floral Bliss",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=438&q=80",
    badge: "choice",
  },
  {
    id: "dummy-5",
    title: "Classic Elegance",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=438&q=80",
  },
]

type CatalogSectionProps = {
  readonly catalogs?: LandingPageCatalog[]
}

export function CatalogSection({ catalogs: apiCatalogs }: CatalogSectionProps) {
  const apiTemplates: Template[] = (apiCatalogs ?? []).map((c) => ({
    id: c.id,
    title: c.invitationTemplateName,
    image: c.invitationTemplateMobileThumbnail,
    badge: c.isNew ? ("new" as TemplateBadge) : undefined,
  }))

  const baseTemplates = apiTemplates.length > 0 ? apiTemplates : DUMMY_CATALOGS

  const displayTemplates = baseTemplates.slice(0, 5)

  // ── Semua hooks dideklarasikan di atas, berurutan, tanpa kondisi ──

  const [activeVirtualIdx, setActiveVirtualIdx] = React.useState(2)
  const [isAnimating, setIsAnimating] = React.useState(false)
  const [zoomLevel, setZoomLevel] = React.useState(1)
  const [isDesktop, setIsDesktop] = React.useState(false)
  const scaleWrapperRef = React.useRef<HTMLDivElement>(null)

  const t = useTranslations("landing.catalog")
  const tCommon = useTranslations("common")

  // Detect browser zoom via devicePixelRatio
  React.useEffect(() => {
    const updateZoom = () => setZoomLevel(globalThis.devicePixelRatio || 1)
    updateZoom()
    globalThis.addEventListener("resize", updateZoom)
    return () => globalThis.removeEventListener("resize", updateZoom)
  }, [])

  // Detect desktop breakpoint (lg = 1024px+)
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // Hitung scale berdasarkan zoom:
  // 100% → 1.00 | 110% → 0.93 | 125% → 0.86 | 150% → 0.75
  const zoomScale = React.useMemo(() => {
    const z = Number.isFinite(zoomLevel) ? zoomLevel : 1
    const clamped = Math.min(1.5, Math.max(1, z))
    const progress = (clamped - 1) / 0.5
    const scale = 1 - progress * 0.25
    return Math.round(scale * 1000) / 1000
  }, [zoomLevel])

  const activeScale = isDesktop ? zoomScale : 1

  // Kompensasi ruang kosong di bawah section akibat scale() transform.
  // scale() mengecilkan visual tapi DOM tetap memakai tinggi asli elemen →
  // muncul gap besar di bawah. marginBottom negatif menutup gap ini.
  React.useEffect(() => {
    const el = scaleWrapperRef.current
    if (!el) return
    const naturalHeight = el.scrollHeight
    const compensation = (activeScale - 1) * naturalHeight
    el.style.transition = "margin-bottom 200ms ease-out"
    el.style.marginBottom = `${compensation}px`
  }, [activeScale])

  if (displayTemplates.length === 0) return null

  const activeIdx =
    ((activeVirtualIdx % displayTemplates.length) + displayTemplates.length) %
    displayTemplates.length
  const activeTemplate = displayTemplates[activeIdx]

  const handleNext = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveVirtualIdx((prev) => prev + 1)
    window.setTimeout(() => setIsAnimating(false), 420)
  }

  const handlePrev = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveVirtualIdx((prev) => prev - 1)
    window.setTimeout(() => setIsAnimating(false), 420)
  }

  return (
    <section
      className="relative mx-auto w-full max-w-[1600px] overflow-hidden px-4 pt-3 pb-4 md:px-12 md:pt-6 md:pb-8 lg:pt-6 lg:pb-8"
      style={{ fontFamily: "var(--font-geist-sans)" }}
      aria-label="Momenia Catalog"
    >
      {/* Wrapper yang di-scale — pill & content di dalamnya agar ikut mengecil */}
      <div
        ref={scaleWrapperRef}
        style={{
          transform: `scale(${activeScale})`,
          transformOrigin: "top center",
          transition: "transform 200ms ease-out",
          willChange: "transform",
        }}
      >
        {/* Background pill */}
        <div
          className="absolute left-1/2 -z-10 w-full -translate-x-1/2 bg-[var(--catalog-bg)]
            bottom-4 top-8 max-w-[340px] rounded-[32px]
            md:bottom-6 md:top-10 md:max-w-[500px] md:rounded-[24px]
            lg:bottom-6 lg:top-10 lg:max-w-[540px] lg:rounded-[40px]"
        />

        <div className="relative flex w-full flex-col items-center pb-10 pt-16 md:pb-12 md:pt-16 lg:pb-12 lg:pt-24">

          {/* ── Header ── */}
          <motion.div
            className="z-10 flex w-full max-w-[340px] flex-col items-center px-6 text-center md:max-w-[500px] md:px-10 lg:max-w-[600px]"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.7 }}
            variants={{
              hidden: { opacity: 0, y: 14 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.28 },
              },
            }}
          >
            <motion.h2
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl lg:text-5xl"
            >
              <span className="text-primary">{tCommon("siteName")}</span>{" "}
              {t("titleSuffix")}
            </motion.h2>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              className="mt-3 w-full text-sm font-normal text-zinc-700 md:mt-4 md:text-base"
            >
              {t("subtitleLine1")}
              <br className="hidden md:block" /> {t("subtitleLine2")}
            </motion.p>
          </motion.div>

          {/* ── Carousel ── */}
          <div className="relative w-full max-w-[1400px] z-30 flex justify-center mt-10 h-[480px] md:mt-6 md:h-[620px] lg:mt-6 lg:h-[600px]">

            {/* LAYER 1: White Box Base Plate */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-full w-auto -translate-x-1/2 -translate-y-1/2 origin-center scale-[1.04]"
              style={{ aspectRatio: "438/798" }}
            >
              <div
                className="absolute bg-white shadow-xl"
                style={{ left: "8.9%", top: "2.5%", width: "82.2%", height: "92.5%", borderRadius: "max(24px, 5%)" }}
              />
            </div>

            {/* LAYER 2: Sliding Rendered Screens */}
            {displayTemplates.map((template, index) => {
              const len = displayTemplates.length
              const loop = Math.round((activeVirtualIdx - index) / len)
              const virtualIndex = index + loop * len
              const offset = virtualIndex - activeVirtualIdx
              const absOffset = Math.abs(offset)
              const isActive = offset === 0
              const maxSide = Math.floor((displayTemplates.length - 1) / 2)
              const isVisible = absOffset <= Math.min(2, maxSide)

              return (
                <motion.div
                  key={template.id}
                  initial={false}
                  animate={{
                    x: `calc(-50% + ${offset * (absOffset === 1 ? 84 : 76)}%)`,
                    y: "-50%",
                    scale: (isActive ? 1 : absOffset === 1 ? 0.86 : 0.74) * 1.04,
                    zIndex: 30 - absOffset * 2,
                    opacity: isVisible ? 1 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 28 }}
                  className="absolute left-1/2 top-1/2 h-full w-auto pointer-events-none"
                  style={{ aspectRatio: "438/798", transformOrigin: "center" }}
                >
                  <div
                    className="absolute overflow-hidden bg-transparent flex flex-col justify-end"
                    style={{ left: "8.9%", top: "2.5%", width: "82.2%", height: "92.5%", borderRadius: "max(24px, 5%)" }}
                  >
                    <div className="w-full h-[94%]">
                      <div className="flex h-full w-full flex-col">
                        <div className="flex-1 p-3 md:p-4">
                          <div
                            className={`relative h-full w-full overflow-hidden rounded-[14px] bg-zinc-100 transition-all ${!isActive ? "shadow-lg" : ""}`}
                            style={{ filter: `blur(${isActive ? 0 : absOffset === 1 ? 1.5 : 2.5}px)` }}
                          >
                            <Image src={template.image} alt={template.title} fill className="object-cover" />
                            {template.badge === "new" && (
                              <div className="absolute left-0 top-0 rounded-br-2xl bg-orange-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-md md:px-4 md:py-2 md:text-xs">
                                NEW
                              </div>
                            )}
                            {template.badge === "choice" && (
                              <div className="absolute left-0 top-0 rounded-br-2xl bg-primary px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-md md:px-4 md:py-2 md:text-[10px]">
                                MOMENIA&apos;S CHOICE
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-center justify-center gap-2 px-4 pb-5 md:px-5 md:pb-6 opacity-0">
                          <h3 className="text-[10px] md:text-sm">{template.title}</h3>
                          <button className="py-1.5 md:py-2">{t("viewTemplate")}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}

            {/* LAYER 3: Stationary Text & Button */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 z-40 h-full w-auto -translate-x-1/2 -translate-y-1/2 origin-center scale-[1.04]"
              style={{ aspectRatio: "438/798" }}
            >
              <div
                className="absolute flex flex-col justify-end"
                style={{ left: "8.9%", top: "2.5%", width: "82.2%", height: "92.5%" }}
              >
                <div className="w-full h-[94%]">
                  <div className="flex h-full w-full flex-col">
                    <div className="flex-1 p-3 md:p-4" />
                    <div className="flex shrink-0 flex-col items-center justify-center gap-2 px-4 pb-5 md:px-5 md:pb-6">
                      <motion.h3
                        key={activeTemplate.id}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-center text-[10px] font-semibold text-zinc-900 md:text-sm"
                      >
                        {activeTemplate.title}
                      </motion.h3>
                      <button className="pointer-events-auto w-full rounded-[8px] border border-blue-500 py-1.5 text-[10px] font-medium text-blue-600 outline-none transition-colors hover:bg-blue-50 md:rounded-[10px] md:py-2 md:text-xs">
                        {t("viewTemplate")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LAYER 4: iPhone Bezel Frame */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 z-50 h-full w-auto -translate-x-1/2 -translate-y-1/2 origin-center scale-[1.04] drop-shadow-2xl"
              style={{ aspectRatio: "438/798" }}
            >
              <Image src={MobileDarkCatalogSVG} alt="iPhone Container Frame" fill className="object-contain drop-shadow-2xl" priority />
            </div>
          </div>

          {/* ── Global Controls ── */}
          <div className="relative z-40 mt-4 md:mt-6 flex flex-col items-center gap-4 md:gap-5 lg:mt-6 lg:gap-5 pb-4 md:pb-6 lg:pb-6">
            <div className="flex justify-center gap-4">
              <button
                onClick={handlePrev}
                disabled={isAnimating}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all hover:bg-zinc-50 hover:text-primary active:scale-90 disabled:cursor-not-allowed disabled:opacity-60 md:h-12 md:w-12"
                aria-label={t("prevAria")}
              >
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={isAnimating}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all hover:bg-zinc-50 hover:text-primary active:scale-90 disabled:cursor-not-allowed disabled:opacity-60 md:h-12 md:w-12"
                aria-label={t("nextAria")}
              >
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </div>

            <button className="w-[300px] md:w-[350px] rounded-xl bg-primary py-3.5 text-sm font-medium text-white shadow-lg shadow-indigo-200/50 transition-transform hover:-translate-y-0.5 active:scale-95 md:text-base">
              {t("viewAllTemplates")}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
