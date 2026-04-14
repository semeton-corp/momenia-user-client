"use client"

import * as React from "react"
import Image, { type StaticImageData } from "next/image"
import { motion } from "framer-motion"
import { Quote, Star } from "lucide-react"

type Props = {
  quote: string
  name: string
  product: string
  avatarSrc: string | StaticImageData
  rating?: number
  className?: string
  isExpanded?: boolean
}

// Tambahkan 'as const' pada property type agar TypeScript tidak komplain
const smoothTransition = {
  type: "tween" as const, 
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  duration: 0.4,
}

export function TestimonialCard({
  quote,
  name,
  product,
  avatarSrc,
  rating = 5,
  className,
  isExpanded = true,
}: Props) {
  const safeRating = Math.max(0, Math.min(5, Math.floor(rating)))

  return (
    <motion.div
      initial={false}
      animate={{
        width: isExpanded ? 364 : 84,
      }}
      transition={smoothTransition}
      className={[
        "relative flex flex-col overflow-hidden bg-white rounded-[24px] shadow-[4px_4px_12.5px_rgba(0,0,0,0.1),_-1px_-1px_3.8px_rgba(0,0,0,0.04)]",
        "h-[353px] shrink-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Konten Expanded */}
      <motion.div
        initial={false}
        animate={{ opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 flex w-[364px] flex-col justify-between p-8 md:p-9"
        style={{ pointerEvents: isExpanded ? "auto" : "none" }}
      >
        <div className="flex flex-col gap-3">
          <p className="text-[17px] leading-[1.5] text-zinc-900 md:text-[18px]">{quote}</p>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star
                key={idx}
                className={[
                  "h-5 w-5 md:h-6 md:w-6",
                  idx < safeRating ? "text-amber-500" : "text-zinc-200",
                ].join(" ")}
                fill="currentColor"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Quote className="h-10 w-10 text-indigo-600" fill="currentColor" strokeWidth={0} />
          </div>
          <div className="flex items-center gap-[19px]">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-zinc-200">
              <Image src={avatarSrc} alt={name} fill className="object-cover" />
            </div>
            <div className="flex min-w-0 flex-col">
              <div className="text-xl font-semibold leading-snug text-zinc-900">{name}</div>
              <div className="text-sm leading-snug text-zinc-500">{product}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Konten Collapsed / Pill */}
      <motion.div
        initial={false}
        animate={{ opacity: isExpanded ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 flex w-[84px] flex-col items-center justify-between py-9"
        style={{ pointerEvents: isExpanded ? "none" : "auto" }}
      >
        <Quote className="h-10 w-10 text-indigo-600" fill="currentColor" strokeWidth={0} />
        <div className="relative mt-auto h-14 w-14 shrink-0 overflow-hidden rounded-full bg-zinc-200">
          <Image src={avatarSrc} alt={name} fill className="object-cover" />
        </div>
      </motion.div>
    </motion.div>
  )
}
