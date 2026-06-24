"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { HeroSection } from "@/components/landing/HeroSection"

const ease = [0.22, 1, 0.36, 1] as const

export function PromoHeroSection() {
  const t = useTranslations("promo.hero")
  const tCommon = useTranslations("common")

  return (
    <div id="home" className="relative overflow-hidden">
      {/* Real HeroSection isolated so its internal z-indices don't escape */}
      <div className="pointer-events-none isolate select-none" aria-hidden="true">
        <HeroSection />
      </div>

      {/* COMING SOON overlay — backdrop-blur blurs the content behind it */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/30 px-4 text-center backdrop-blur-sm">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="text-xs font-bold uppercase tracking-[0.35em] text-white/70 md:text-sm"
        >
          {t("badge")}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.15 }}
          className="text-5xl font-bold tracking-tight text-white md:text-7xl lg:text-8xl"
        >
          {tCommon("siteName").toUpperCase()}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.3 }}
          className="max-w-md text-base text-white/75 md:text-xl"
        >
          {t("subtitle")}
        </motion.p>
      </div>
    </div>
  )
}
