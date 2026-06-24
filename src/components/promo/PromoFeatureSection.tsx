"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { FeatureSection } from "@/components/landing/FeatureSection"
import { type LandingPageFeature } from "@/lib/api/landing-page/landing-page.types"

const ease = [0.22, 1, 0.36, 1] as const

type Props = {
  readonly features?: LandingPageFeature[]
}

export function PromoFeatureSection({ features }: Props) {
  const t = useTranslations("promo.features")
  const tCommon = useTranslations("common")

  return (
    <div id="promo-features" className="relative overflow-hidden">
      {/* Real FeatureSection isolated so its internal z-indices don't escape */}
      <div className="pointer-events-none isolate select-none" aria-hidden="true">
        <FeatureSection features={features} />
      </div>

      {/* COMING SOON overlay — frosted glass on the light feature background */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white/65 px-4 text-center backdrop-blur-md">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="text-xs font-bold uppercase tracking-[0.35em] text-primary/70 md:text-sm"
        >
          {t("badge")}
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.15 }}
          className="text-5xl font-bold tracking-tight text-foreground md:text-7xl lg:text-8xl"
        >
          {tCommon("siteName").toUpperCase()}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.3 }}
          className="max-w-lg text-base text-muted-foreground md:text-xl"
        >
          {t("subtitle")}
        </motion.p>
      </div>
    </div>
  )
}
