"use client"

import * as React from "react"
import { PenTool, LayoutGrid, Music, Users, MailOpen, ScrollText, Leaf } from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { FeatureCard } from "./FeatureCard"

const iconClass = "h-5 w-5 md:h-6 md:w-6 text-indigo-600 transition-colors duration-300"

const featuresData = [
  {
    id: "selfEditable",
    icon: <PenTool className={iconClass} />,
  },
  {
    id: "smartDashboard",
    icon: <LayoutGrid className={iconClass} />,
  },
  {
    id: "spotifyMusic",
    icon: <Music className={iconClass} />,
  },
  {
    id: "rsvpDashboard",
    icon: <Users className={iconClass} />,
  },
  {
    id: "afterEventNotes",
    icon: <MailOpen className={iconClass} />,
  },
  {
    id: "autoText",
    icon: <ScrollText className={iconClass} />,
  },
  {
    id: "addOnFeatures",
    icon: <Leaf className={iconClass} />,
  },
]

export function FeatureSection() {
  const [activeCardIndex, setActiveCardIndex] = React.useState<number | null>(0)
  const t = useTranslations("landing.features")
  const tCommon = useTranslations("common")

  return (
    <section
      id="features"
      className="mx-auto w-full max-w-[1600px] px-4 pt-2 pb-10 md:px-12 md:pt-4 md:pb-12 lg:pt-6"
      style={{ fontFamily: "var(--font-geist-sans)" }}
      aria-label="Memoria Features"
    >
      {/* Container Title */}
      <motion.div
        className="mb-12 flex flex-col items-center text-center md:mb-16"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.65 }}
        variants={{
          hidden: { opacity: 0, y: 14 },
          show: { opacity: 1, y: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
        }}
      >
        <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
          <span className="text-primary">{tCommon("siteName")}</span> {t("titleSuffix")}
        </h2>
        <p className="mt-4 max-w-2xl text-base font-normal text-muted-foreground md:text-lg">
          {t("subtitle")}
        </p>
      </motion.div>

      {/* Grid Layout */}
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
          // Memsastikan elemen ke-7 selalu center di baris paling bawah saat mode 3 kolom (lg)
          // dan mode 2 kolom (sm)
          const isLastItem = index === 6
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
                show: { opacity: 1, y: 0, transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              <FeatureCard
                title={t(`items.${feature.id}.title`)}
                description={t(`items.${feature.id}.description`)}
                icon={feature.icon}
                className="h-full w-full"
                isExpanded={activeCardIndex === index}
                onToggle={() => setActiveCardIndex(activeCardIndex === index ? null : index)}
              />
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
