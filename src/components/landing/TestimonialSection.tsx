"use client"

import * as React from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { TestimonialCard } from "@/components/landing/TestimonialCard"
import { LandingPageTestimonial } from "@/lib/api/landing-page/landing-page.types"

const FALLBACK_AVATAR = "https://ui-avatars.com/api/?background=6366f1&color=fff&size=128"

function getZoomLevel(): number {
  if (typeof window === "undefined") return 1
  return Math.round((window.outerWidth / window.innerWidth) * 100) / 100
}

type TestimonialSectionProps = {
  readonly testimonials?: LandingPageTestimonial[]
  readonly locale?: string
}

export function TestimonialSection({ testimonials: apiTestimonials, locale = "en" }: TestimonialSectionProps) {
  const testimonials = (apiTestimonials ?? []).map((t) => ({
    id: String(t.id),
    quote: t.testimonial,
    name: t.name,
    product: "",
    avatarSrc: t.profileImage || FALLBACK_AVATAR,
    rating: t.rating,
  }))
  const [activeVirtualIdx, setActiveVirtualIdx] = React.useState(2)
  const [isAnimating, setIsAnimating] = React.useState(false)
  const [viewportWidth, setViewportWidth] = React.useState(0)
  const [zoomLevel, setZoomLevel] = React.useState(1)

  React.useEffect(() => {
    const update = () => {
      setViewportWidth(window.innerWidth)
      setZoomLevel(getZoomLevel())
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

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

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAnimating) {
        setIsAnimating(true)
        setActiveVirtualIdx((prev) => prev + 1)
        window.setTimeout(() => setIsAnimating(false), 420)
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [activeVirtualIdx, isAnimating])

  const isDesktop = viewportWidth >= 1024
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024
  const isMobile = viewportWidth < 768

  const expandedWidth = isDesktop ? 340 : isTablet ? 320 : 260
  const pillWidth = viewportWidth >= 768 ? 80 : 60

  const visibleOffsets = React.useMemo(() => {
    if (isMobile) return [-2, -1, 0, 1, 2]

    if (isDesktop) {
      if (zoomLevel >= 1.7) return [0]
      if (zoomLevel >= 1.45) return [-1, 0, 1]
      if (zoomLevel >= 1.2) return [-2, -1, 0, 1, 2]
      return [-4, -3, -2, -1, 0, 1, 2, 3, 4]
    }

    // Tablet
    if (zoomLevel >= 1.2) return [0]
    return [-2, -1, 0, 1, 2]
  }, [isDesktop, isTablet, isMobile, zoomLevel])

  const isLowZoom = zoomLevel <= 1.1
  const lowZoomButtonMargin = isLowZoom && !isMobile ? 48 : 0
  let btnSize = 40
  if (isMobile) {
    btnSize = 36
  } else if (isLowZoom) {
    btnSize = 44
  }

  if (testimonials.length === 0) return null

  return (
    <section id="review" className="relative w-full overflow-x-hidden" aria-label="Testimonials">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2400&auto=format&fit=crop"
          alt="Testimonials background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/35" />
  <div className="absolute inset-0 bg-linear-to-r from-black/35 via-transparent to-black/35" />
      </div>

      {/* Kontainer Utama */}
      <div className="relative z-10 w-full px-3 py-10 md:px-6 md:py-14 lg:py-16">
        <div
          className="mx-auto flex w-full max-w-375 items-center justify-center"
          style={{ gap: isLowZoom ? 64 : undefined }}
        >

          {/* Tombol Prev */}
          <button
            onClick={handlePrev}
            disabled={isAnimating}
            className="z-30 flex shrink-0 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Previous testimonial"
            type="button"
            style={{ width: btnSize, height: btnSize, marginRight: lowZoomButtonMargin }}
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </button>

          {/* Container Card Stack */}
          <div
            className="relative flex-1 px-2 md:px-4"
            style={{ height: "420px" }}
          >
            {visibleOffsets.map((offset) => {
              const virtualIndex = activeVirtualIdx + offset
              const actualIndex = ((virtualIndex % testimonials.length) + testimonials.length) % testimonials.length
              const t = testimonials[actualIndex]

              const absOffset = Math.abs(offset)
              const sign = Math.sign(offset)

              const showExpandedNeighbors = isDesktop
              const isExpanded = absOffset === 0 || (showExpandedNeighbors && absOffset === 1)

              const isMobileStack = isMobile && absOffset >= 1

              let opacity = 1
              const zIndex = 10 - absOffset

              const mobileStackExtraInset = isMobileStack ? 18 : 0

              const gap = isDesktop ? 24 : 16
              let xOffset = 0

              if (absOffset === 1) {
                if (isDesktop) {
                  xOffset = sign * (expandedWidth + gap)
                } else if (isTablet) {
                  xOffset = sign * (expandedWidth / 2 + gap + pillWidth / 2)
                } else {
                  const peekAmount = 2
                  xOffset = sign * (expandedWidth / 2 + peekAmount - mobileStackExtraInset)
                }
              } else if (absOffset >= 2) {
                if (isDesktop) {
                  const base = expandedWidth + gap + expandedWidth / 2 + pillWidth / 2 + gap
                  const stackIndex = absOffset - 2
                  xOffset = sign * (base + stackIndex * 28)
                } else if (isTablet) {
                  const base = expandedWidth / 2 + gap + pillWidth / 2 + gap
                  const stackIndex = absOffset - 2
                  xOffset = sign * (base + stackIndex * 24)
                } else {
                  const base = expandedWidth / 2 + 6
                  const stackIndex = absOffset - 2
                  xOffset = sign * (base + stackIndex * 6 - mobileStackExtraInset)
                  if (isMobile) opacity = 0.18
                }
              }

              return (
                <motion.div
                  key={virtualIndex}
                  initial={false}
                  animate={{
                    x: xOffset,
                    y: "-50%",
                    scale: 1,
                    opacity,
                    filter: "none",
                    width: isExpanded ? expandedWidth : pillWidth,
                  }}
                  transition={{
                    x: { type: "spring", stiffness: 240, damping: 30 },
                    y: { type: "spring", stiffness: 240, damping: 30 },
                    opacity: { duration: 0.2 },
                    width: { type: "spring", stiffness: 240, damping: 30 },
                  }}
                  className={[
                    "absolute left-1/2 top-1/2 flex justify-center -translate-x-1/2",
                    !isMobileStack && "overflow-hidden",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ transformOrigin: "center", zIndex }}
                >
                  {isMobileStack ? (
                    <div
                      className="pointer-events-none rounded-3xl bg-white"
                      style={{ width: 210, height: 300, boxShadow: "none" }}
                    />
                  ) : (
                    <TestimonialCard
                      quote={t.quote}
                      name={t.name}
                      product={t.product}
                      avatarSrc={t.avatarSrc}
                      rating={t.rating}
                      isExpanded={isExpanded}
                      expandedWidth={expandedWidth}
                      pillWidth={pillWidth}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Tombol Next */}
          <button
            onClick={handleNext}
            disabled={isAnimating}
            className="z-30 flex shrink-0 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Next testimonial"
            type="button"
            style={{ width: btnSize, height: btnSize, marginLeft: lowZoomButtonMargin }}
          >
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
          </button>

        </div>
      </div>
    </section>
  )
}