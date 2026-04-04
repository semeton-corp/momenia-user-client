"use client"

import * as React from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { TestimonialCard } from "@/components/landing/TestimonialCard"

type Testimonial = {
  id: string
  quote: string
  name: string
  product: string
  avatarSrc: string
  rating: number
}

const testimonials: Testimonial[] = [
  {
    id: "t-1",
    quote: "I love how interactive the invitation is. Guests could send messages and even gifts it felt so personal and modern.",
    name: "Jenny Wilson",
    product: "Bride",
    avatarSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=320&auto=format&fit=crop",
    rating: 5,
  },
  {
    id: "t-2",
    quote: "MEMORIA made everything so easy. I was able to create and customize my invitation without any help, and it looked absolutely beautiful.",
    name: "Albert Flores",
    product: "Bride",
    avatarSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=320&auto=format&fit=crop",
    rating: 5,
  },
  {
    id: "t-3",
    quote: "The dashboard is super intuitive. I could manage guests and track RSVPs in real time without any confusion at all.",
    name: "Savannah Nguyen",
    product: "Event Organizer",
    avatarSrc: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=320&auto=format&fit=crop",
    rating: 5,
  },
  {
    id: "t-4",
    quote: "Templates are elegant and the customization feels smooth. Sharing the link to family was instant and effortless.",
    name: "Cameron Williamson",
    product: "Groom",
    avatarSrc: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=320&auto=format&fit=crop",
    rating: 5,
  },
  {
    id: "t-5",
    quote: "Everything looks premium. The experience from design to publishing is simple, fast, and feels really polished.",
    name: "Leslie Alexander",
    product: "Bride",
    avatarSrc: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=320&auto=format&fit=crop",
    rating: 5,
  },
]

export function TestimonialSection() {
  const [activeVirtualIdx, setActiveVirtualIdx] = React.useState(2)
  const [isAnimating, setIsAnimating] = React.useState(false)
  const [viewportWidth, setViewportWidth] = React.useState(0)

  React.useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth)
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

  // Pengaturan Layout Responsif
  const isDesktop = viewportWidth >= 1024
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024
  const isMobile = viewportWidth > 0 && viewportWidth < 768

  // Lebar card dikorbankan sedikit di mobile (260px) agar card samping bisa mengintip
  const expandedWidth = isDesktop ? 340 : isTablet ? 320 : 260
  const pillWidth = viewportWidth >= 768 ? 80 : 60

  // Array offset bayangan untuk memaksa render banyak elemen sekaligus
  const visibleOffsets = [-4, -3, -2, -1, 0, 1, 2, 3, 4]

  return (
    <section id="review" className="relative w-full overflow-x-hidden" aria-label="Testimonials">
      {/* Background Section */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2400&auto=format&fit=crop"
          alt="Testimonials background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/35" />
      </div>

      {/* Kontainer Utama */}
      <div className="relative z-10 w-full px-4 py-10 md:px-6 md:py-14 lg:py-16">
        <div className="relative mx-auto flex w-full max-w-[1500px] items-center justify-center">
          
          {/* Tombol Back */}
          <button
            onClick={handlePrev}
            disabled={isAnimating}
            className="absolute left-3 top-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 md:left-6 lg:left-12 xl:left-24"
            aria-label="Previous testimonial"
            type="button"
            style={{
              transform: isMobile
                ? "translate3d(0, -50%, 0)"
                : "translate3d(calc(-1 * clamp(36px, 14vw, 220px)), -50%, 0)",
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Container Card Stack */}
          <div
            className="relative w-full max-w-[1400px]"
            style={{ height: "420px", ["--card-step" as string]: "clamp(390px, 30vw, 420px)" }}
          >
            {visibleOffsets.map((offset) => {
              const virtualIndex = activeVirtualIdx + offset
              const actualIndex = ((virtualIndex % testimonials.length) + testimonials.length) % testimonials.length
              const t = testimonials[actualIndex]

              const absOffset = Math.abs(offset)
              const sign = Math.sign(offset)

              // Penentuan Expand: Desktop expand 3 card, Tablet/Mobile hanya 1 di tengah
              const showExpandedNeighbors = isDesktop
              const isExpanded = absOffset === 0 || (showExpandedNeighbors && absOffset === 1)
              
              const scale = 1 
              const blur = 0
              let opacity = 1
              const zIndex = 10 - absOffset

              const gap = isDesktop ? 24 : 16
              let xOffset = 0

              if (absOffset === 1) {
                if (isDesktop) {
                  // Desktop: Card berdampingan lebar
                  xOffset = sign * (expandedWidth + gap)
                } else if (isTablet) {
                  // Tablet: Card pil berdampingan di luar card utama
                  xOffset = sign * (expandedWidth / 2 + gap + pillWidth / 2)
                } else {
                  // Mobile: Card pil ditimpa di belakang card utama, mengintip ~20px
                  const peekAmount = 20
                  xOffset = sign * (expandedWidth / 2 + peekAmount - pillWidth / 2)
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
                  // Mobile: Sembunyikan tumpukan ekstra agar tidak berat/berantakan
                  xOffset = sign * (expandedWidth / 2 + 20 - pillWidth / 2)
                  opacity = 0 
                }
              }

              return (
                <motion.div
                  key={virtualIndex}
                  initial={false}
                  animate={{
                    x: xOffset,
                    y: "-50%",
                    scale,
                    opacity,
                    filter: blur === 0 ? "none" : `blur(${blur}px)`,
                    width: isExpanded ? expandedWidth : pillWidth
                  }}
                  transition={{
                    x: { type: "spring", stiffness: 240, damping: 30 },
                    y: { type: "spring", stiffness: 240, damping: 30 },
                    opacity: { duration: 0.2 },
                    width: { type: "spring", stiffness: 240, damping: 30 },
                  }}
                  className={[
                    "absolute left-1/2 top-1/2 flex justify-center -translate-x-1/2 overflow-hidden",
                    // Hilangkan paksaan flex yang bentrok dari Tailwind, biarkan Framer Motion mengatur Opacity
                  ].filter(Boolean).join(" ")}
                  style={{ transformOrigin: "center", zIndex }}
                >
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
                </motion.div>
              )
            })}
          </div>

          {/* Tombol Next */}
          <button
            onClick={handleNext}
            disabled={isAnimating}
            className="absolute right-3 top-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 md:right-6 lg:right-12 xl:right-24"
            aria-label="Next testimonial"
            type="button"
            style={{
              transform: isMobile
                ? "translate3d(0, -50%, 0)"
                : "translate3d(clamp(36px, 14vw, 220px), -50%, 0)",
            }}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}