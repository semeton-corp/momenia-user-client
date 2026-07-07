"use client"

import * as React from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export type FaqItem = {
  id: string
  question: string
  answer: string
}

type FaqAccordionProps = {
  items: FaqItem[]
  defaultOpenId?: string
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const update = () => setIsMobile(mediaQuery.matches)

    update()
    mediaQuery.addEventListener("change", update)
    return () => mediaQuery.removeEventListener("change", update)
  }, [breakpoint])

  return isMobile
}

export function FaqAccordion({ items, defaultOpenId }: FaqAccordionProps) {
  const isMobile = useIsMobile()
  const [openId, setOpenId] = React.useState<string | null>(defaultOpenId ?? items[0]?.id ?? null)

  const toggleOpen = (id: string) => {
    setOpenId((current) => (current === id ? null : id))
  }

  return (
    <motion.div
      className="space-y-3 md:space-y-4"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.22 } },
      }}
    >
      {items.map((item) => {
        const isOpen = openId === item.id

        return (
          <motion.article
            key={item.id}
            className={cn(
              "overflow-hidden rounded-3xl border border-indigo-100 transition-colors",
              isOpen ? "bg-indigo-50" : "bg-white",
            )}
            variants={{
              hidden: { opacity: 0, y: 14 },
              show: { opacity: 1, y: 0, transition: { duration: 1.35, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            <button
              type="button"
              onClick={() => toggleOpen(item.id)}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left md:p-7",
                !isOpen && "hover:bg-slate-50",
              )}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${item.id}`}
            >
              <span
                className={cn(
                  "text-base font-semibold leading-6 md:text-xl md:leading-7",
                  isOpen ? "text-indigo-800" : "text-zinc-900",
                )}
              >
                {item.question}
              </span>

              {isOpen ? (
                <ChevronUp className="h-6 w-6 shrink-0 text-indigo-600" />
              ) : (
                <ChevronDown className="h-6 w-6 shrink-0 text-indigo-600" />
              )}
            </button>

            <motion.div
              id={`faq-answer-${item.id}`}
              initial={false}
              animate={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid"
              aria-hidden={!isOpen}
            >
              <div className="min-h-0 overflow-hidden">
                <div className={cn("text-sm font-medium text-zinc-800", isMobile ? "px-4 pb-4" : "px-7 pb-7")}>
                  {item.answer}
                </div>
              </div>
            </motion.div>
          </motion.article>
        )
      })}
    </motion.div>
  )
}
