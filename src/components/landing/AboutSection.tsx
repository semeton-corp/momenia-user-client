"use client"

import * as React from "react"
import Image from "next/image"
import { WandSparkles, PenTool, Feather, LayoutGrid } from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import AboutUsImage from "@/assets/llandingpage/about-us.svg"

export function AboutSection() {
  // ── Semua hooks dideklarasikan di atas, berurutan ──
  const [zoomLevel, setZoomLevel] = React.useState(1)
  const [isDesktop, setIsDesktop] = React.useState(false)
  const scaleWrapperRef           = React.useRef<HTMLDivElement>(null)

  const t       = useTranslations("landing.about")
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

  return (
    <section
      id="about"
      className="mx-auto w-full max-w-[1600px] px-4 py-4 md:px-12 md:pt-10 md:pb-4 lg:pt-12 lg:pb-6"
      aria-label="About Us"
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
        <div className="flex flex-col items-center gap-4 pt-6 md:gap-6 md:pt-8 lg:flex-row lg:items-center lg:justify-between lg:gap-20 lg:pt-10">

          {/* Mobile Heading (Visible only on mobile/tablet) */}
          <div className="order-1 w-full text-center lg:hidden">
            <motion.h2
              className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
              style={{ fontFamily: "var(--font-geist-sans)" }}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {t("title")} <span className="text-primary">{tCommon("siteName")}</span>
            </motion.h2>
          </div>

          {/* Konten Text */}
          <motion.div
            className="order-3 flex flex-1 flex-col justify-center gap-5 text-center lg:order-first lg:max-w-[800px] lg:text-left"
            style={{ fontFamily: "var(--font-geist-sans)" }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.45 }}
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 1.8, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.35 },
              },
            }}
          >
            <motion.h2
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
              className="hidden text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:block lg:text-5xl"
            >
              {t("title")} <span className="text-primary">{tCommon("siteName")}</span>
            </motion.h2>

            <div className="flex flex-col items-center gap-5 text-sm leading-relaxed text-slate-700 md:text-base lg:items-start lg:text-lg lg:leading-relaxed">
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  show: { opacity: 1, y: 0, transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="font-normal"
              >
                {t("p1Part1")}
                <span className="font-semibold text-primary">{t("p1Highlight")}</span>
                {t("p1Part2")}
              </motion.p>
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  show: { opacity: 1, y: 0, transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="font-normal"
              >
                {t("p2")}
              </motion.p>
            </div>
          </motion.div>

          {/* Gambar SVG & Floating Icons */}
          <div className="order-2 flex flex-1 justify-center lg:order-last lg:justify-end">
            <div className="relative w-[95%] max-w-[450px] md:max-w-[500px] lg:w-full lg:max-w-[600px]">
              {/* Ellipse Radial Background Glow */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[80%] w-[100%] -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-primary/20 blur-[50px] md:w-[130%] md:blur-[80px] lg:h-[90%] lg:w-[140%] lg:blur-[120px]" />

              <Image
                src={AboutUsImage}
                alt="About Momenia dashboard preview"
                className="relative z-10 h-auto w-full object-contain"
              />

              {/* Floating Icon: Magic Wand (Top Right, Front) */}
              <div className="absolute right-1 top-[15%] z-20 flex aspect-square w-10 items-center justify-center rounded-lg bg-white shadow-xl md:right-1 md:w-14 md:rounded-xl lg:right-2 lg:w-[72px] lg:rounded-[20px]">
                <WandSparkles className="size-5 text-primary md:size-6 lg:size-[32px]" strokeWidth={2} />
              </div>

              {/* Floating Icon: Pen Tool (Middle Right, Behind) */}
              <div className="absolute -right-1 top-[32%] z-0 flex aspect-square w-10 items-center justify-center rounded-lg bg-white shadow-md md:-right-1 md:w-14 md:rounded-xl lg:-right-2 lg:w-[72px] lg:rounded-[20px]">
                <PenTool className="size-5 text-primary md:size-6 lg:size-[32px]" strokeWidth={2} />
              </div>

              {/* Floating Icon: Feather (Middle Left, Front) */}
              <div className="absolute left-1 bottom-[28%] z-20 flex aspect-square w-10 items-center justify-center rounded-lg bg-white shadow-xl md:left-1 md:w-14 md:rounded-xl lg:left-2 lg:w-[72px] lg:rounded-[20px]">
                <Feather className="size-5 text-primary md:size-6 lg:size-[32px]" strokeWidth={2} />
              </div>

              {/* Floating Icon: Layout Grid (Bottom Left, Behind) */}
              <div className="absolute -left-1 bottom-[10%] z-0 flex aspect-square w-10 items-center justify-center rounded-lg bg-white shadow-md md:-left-1 md:w-14 md:rounded-xl lg:-left-2 lg:w-[72px] lg:rounded-[20px]">
                <LayoutGrid className="size-5 text-primary md:size-6 lg:size-[32px]" strokeWidth={2} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}