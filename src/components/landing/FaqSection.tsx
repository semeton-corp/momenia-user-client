"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { FaqAccordion, type FaqItem } from "@/components/landing/FaqAccordion"

export function FaqSection() {
  const t = useTranslations("landing.faq")
  const tCommon = useTranslations("common")

  const faqItems: FaqItem[] = [
    {
      id: "faq-1",
      question: t("items.editAfterPublish.q"),
      answer: t("items.editAfterPublish.a"),
    },
    {
      id: "faq-2",
      question: t("items.startCreating.q"),
      answer: t("items.startCreating.a"),
    },
    {
      id: "faq-3",
      question: t("items.shareWithGuests.q"),
      answer: t("items.shareWithGuests.a"),
    },
    {
      id: "faq-4",
      question: t("items.trackRsvp.q"),
      answer: t("items.trackRsvp.a"),
    },
    {
      id: "faq-5",
      question: t("items.suitableEvents.q"),
      answer: t("items.suitableEvents.a"),
    },
  ]

  return (
    <section id="faq" className="w-full" aria-label="FAQ">
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
    </section>
  )
}
