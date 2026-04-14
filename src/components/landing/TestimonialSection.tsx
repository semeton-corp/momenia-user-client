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
  const [activeVirtualIdx, setActiveVirtualIdx] = React.useState(1)
  const [isAnimating, setIsAnimating] = React.useState(false)

  const activeIdx = ((activeVirtualIdx % testimonials.length) + testimonials.length) % testimonials.length

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

  // Array offset bayangan untuk memaksa render 11 elemen sekaligus (looping data)
  const visibleOffsets = [ -4, -3, -2, -1, 0, 1, 2, 3, 4,]

  return (
    <section className="relative w-full overflow-x-hidden" aria-label="Testimonials">
      
      {/* Background Section (tetap full-width) */}
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
        
        {/* max-w untuk tombol ditarik jauh keluar container */}
        <div className="relative mx-auto flex w-full max-w-[1500px] items-center justify-center">
          
          {/* Tombol Back: Digeser jauh ke luar menggunakan md:left-6 lg:left-12 xl:left-24 */}
          <button
            onClick={handlePrev}
            disabled={isAnimating}
            className="absolute left-2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 md:left-6 lg:left-12 xl:left-24"
            aria-label="Previous testimonial"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Container Card Stack dengan batas max-w sendiri agar rapi di tengah */}
          <div
            className="relative w-full max-w-[1400px]"
            // Tentukan card-step yang lega agar card tidak saling tumpang tindih
            style={{ height: "420px", ["--card-step" as any]: "clamp(390px, 30vw, 420px)" }}
          >
            {visibleOffsets.map((offset) => {
              const virtualIndex = activeVirtualIdx + offset
              const actualIndex = ((virtualIndex % testimonials.length) + testimonials.length) % testimonials.length
              const t = testimonials[actualIndex]

              const absOffset = Math.abs(offset)
              const sign = Math.sign(offset)

              const isExpanded = absOffset <= 1
              
              // KUNCI: Scale dikunci di 1. Tidak ada yang membesar/mengecil!
              const scale = 1 
              
              // KUNCI PERBAIKAN: Opacity dikunci di 1. Tidak ada yang pudar!
              const opacity = 1
              const blur = 0 // Blur juga dimatikan
              const zIndex = 10 - absOffset

              // Perhitungan Posisi X yang lebih aman agar tidak tabrakan
              const expandedWidth = 364
              const pillWidth = 84
              const gap = 24 // Jarak antar card

              let xOffset = 0
              if (absOffset === 1) {
                xOffset = sign * (expandedWidth + gap)
              } else if (absOffset >= 2) {
                // Tentukan titik mulai tumpukan pil
                const base = expandedWidth + gap + expandedWidth / 2 + pillWidth / 2 + gap
                // Geser pil ke-1, ke-2, ke-3 berdasarkan urutannya
                const stackIndex = absOffset - 2
                // stackX adalah jarak pergeseran antar tumpukan pil
                xOffset = sign * (base + stackIndex * 28)
              }

              return (
                <motion.div
                  key={virtualIndex} // Wajib virtualIndex agar FramerMotion bisa melacak pergeserannya
                  initial={false}
                  animate={{
                    x: xOffset,
                    y: "-50%",
                    scale, // Tetap 1
                    opacity, // Tetap 1
                    filter: blur === 0 ? "none" : `blur(${blur}px)`,
                  }}
                  transition={{
                    x: { type: "spring", stiffness: 240, damping: 30 },
                    y: { type: "spring", stiffness: 240, damping: 30 },
                    opacity: { duration: 0.2 },
                    scale: { type: "spring", stiffness: 240, damping: 30 },
                  }}
                  className={[
                    "absolute left-1/2 top-1/2 flex justify-center -translate-x-1/2",
                    isExpanded ? "w-full max-w-[364px]" : `w-[${pillWidth}px]`,
                    absOffset === 1 ? "hidden md:flex" : "",
                    // Pil akan ditumpuk sampai 3 tingkat di layer desktop (offset 2, 3, 4)
                    absOffset >= 2 && absOffset <= 4 ? "hidden xl:flex" : "",
                    absOffset === 0 ? "!flex" : "" // Memastikan yang tengah selalu muncul (mobile)
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ transformOrigin: "center", zIndex }}
                >
                  <TestimonialCard
                    quote={t.quote}
                    name={t.name}
                    product={t.product}
                    avatarSrc={t.avatarSrc}
                    rating={t.rating}
                    isExpanded={isExpanded} 
                  />
                </motion.div>
              )
            })}
          </div>

          {/* Tombol Next: Digeser jauh ke luar menggunakan md:right-6 lg:right-12 xl:right-24 */}
          <button
            onClick={handleNext}
            disabled={isAnimating}
            className="absolute right-2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 md:right-6 lg:right-12 xl:right-24"
            aria-label="Next testimonial"
            type="button"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        
        {/* Kontainer Mobile Nav (dihilangkan karena tombol sudah di kiri-kanan) */}
        
      </div>
    </section>
  )
}