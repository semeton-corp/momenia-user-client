"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import MobileDarkCatalogSVG from "@/assets/llandingpage/Mobile-dark-catalog.svg"

const templates = [
  {
    id: 1,
    title: "Elegant Monocrome",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Evelyn & Martinus",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "The White Vow",
    image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Adinda & John",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Rustic Romance",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600&auto=format&fit=crop",
  },
]

const displayTemplates = [
  ...templates,
  ...templates.map((t) => ({ ...t, id: `${t.id}-dup` })),
]

export function CatalogSection() {
  const [activeVirtualIdx, setActiveVirtualIdx] = React.useState(2)
  const [isAnimating, setIsAnimating] = React.useState(false)
  const t = useTranslations("landing.catalog")
  const tCommon = useTranslations("common")

  const activeIdx = ((activeVirtualIdx % displayTemplates.length) + displayTemplates.length) % displayTemplates.length
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
      className="relative mx-auto w-full max-w-[1600px] overflow-hidden px-4 pt-3 pb-4 md:px-12 md:pt-6 md:pb-8"
      style={{ fontFamily: "var(--font-geist-sans)" }}
      aria-label="Memoria Catalog"
    >
      <div className="absolute bottom-4 left-1/2 top-8 -z-10 w-full max-w-[340px] -translate-x-1/2 rounded-[32px] bg-[var(--catalog-bg)] md:bottom-6 md:top-10 md:max-w-[500px] md:rounded-[24px] lg:bottom-8 lg:top-12 lg:max-w-[600px] lg:rounded-[40px]" />
      
      <div className="relative flex w-full flex-col items-center pb-6 pt-10 md:pb-8 md:pt-14 lg:pb-10 lg:pt-16">
        
        {/* Header */}
        <motion.div
          className="z-10 flex w-full max-w-[340px] flex-col items-center px-6 text-center md:max-w-[500px] md:px-10 lg:max-w-[600px]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.7 }}
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0, transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.28 } },
          }}
        >
          <motion.h2
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl lg:text-5xl"
          >
            <span className="text-primary">{tCommon("siteName")}</span> {t("titleSuffix")}
          </motion.h2>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            className="mt-3 w-full text-sm font-normal text-zinc-700 md:mt-4 md:text-base"
          >
            {t("subtitleLine1")}
            <br className="hidden md:block" /> {t("subtitleLine2")}
          </motion.p>
        </motion.div>

        {/* Carousel Visual Bounds */}
        <div className="relative mt-10 w-full max-w-[1400px] h-[480px] md:h-[620px] lg:h-[750px] z-30 flex justify-center">
          
          {/* LAYER 1: STATIONARY White Box Base Plate */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-full w-auto -translate-x-1/2 -translate-y-1/2 origin-center scale-[1.04]"
            style={{ aspectRatio: "438/798" }}
          >
             <div
               className="absolute bg-white shadow-xl"
               style={{
                  left: "8.9%", top: "2.5%", width: "82.2%", height: "92.5%",
                  borderRadius: "max(24px, 5%)"
               }}
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

            const baseScale = 1.04
            const relativeScale = isActive ? 1 : absOffset === 1 ? 0.86 : 0.74 
            const scale = relativeScale * baseScale
            const zIndex = 30 - absOffset * 2
            const step = absOffset === 1 ? 84 : 76 
            const blurPx = isActive ? 0 : absOffset === 1 ? 1.5 : 2.5
            const isVisible = absOffset <= 2
            
            return (
              <motion.div
                key={template.id}
                initial={false}
                animate={{
                  x: `calc(-50% + ${offset * step}%)`,
                  y: "-50%",
                  scale,
                  zIndex,
                  opacity: isVisible ? 1 : 0, 
                }}
                transition={{ type: "spring", stiffness: 220, damping: 28 }}
                className="absolute left-1/2 top-1/2 h-full w-auto pointer-events-none"
                style={{ aspectRatio: "438/798", transformOrigin: "center" }}
              >
                <div 
                   className="absolute overflow-hidden bg-transparent flex flex-col justify-end"
                   style={{ 
                      left: "8.9%", top: "2.5%", width: "82.2%", height: "92.5%",
                      borderRadius: "max(24px, 5%)" 
                   }}
                >
                  <div className="w-full" style={{ height: "94%" }}>
                    <div className="flex h-full w-full flex-col">
                      <div className="flex-1 p-3 md:p-4">
                        <div 
                          className={`relative h-full w-full overflow-hidden rounded-[14px] bg-zinc-100 transition-all ${!isActive ? "shadow-lg" : ""}`}
                          style={{ filter: `blur(${blurPx}px)` }}
                        >
                          <Image src={template.image} alt={template.title} fill className="object-cover" />
                        </div>
                      </div>
                      {/* DIUBAH: pb-3 jadi pb-5, md:pb-4 jadi md:pb-6 agar sedikit terdorong ke atas */}
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

          {/* LAYER 3: STATIONARY Text & Button */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-40 h-full w-auto -translate-x-1/2 -translate-y-1/2 origin-center scale-[1.04]"
            style={{ aspectRatio: "438/798" }}
          >
             <div
               className="absolute flex flex-col justify-end"
               style={{
                  left: "8.9%", top: "2.5%", width: "82.2%", height: "92.5%"
               }}
             >
                <div className="w-full" style={{ height: "94%" }}>
                  <div className="flex h-full w-full flex-col">
                    <div className="flex-1 p-3 md:p-4" />

                    {/* DIUBAH: pb-3 jadi pb-5, md:pb-4 jadi md:pb-6 agar sedikit terdorong ke atas sinkron dengan LAYER 2 */}
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

          {/* LAYER 4: STATIONARY iPhone Bezel Frame */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-50 h-full w-auto -translate-x-1/2 -translate-y-1/2 origin-center scale-[1.04] drop-shadow-2xl"
            style={{ aspectRatio: "438/798" }}
          >
             <Image 
                src={MobileDarkCatalogSVG} 
                alt="iPhone Container Frame" 
                fill 
                className="object-contain drop-shadow-2xl" 
                priority
             />
          </div>

        </div>

        {/* Global Controls */}
        <div className="relative z-40 mt-4 md:mt-6 flex flex-col items-center gap-4 md:gap-5">
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
    </section>
  )
}