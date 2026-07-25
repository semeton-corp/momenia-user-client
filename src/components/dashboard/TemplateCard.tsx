"use client"

import Image from "next/image"
import { Heart } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"

type TemplateCardProps = {
  id: string | number
  title: string
  category: string
  price: number
  originalPrice?: number
  imageUrl: string
  isFavourite?: boolean
  onFavouriteToggle?: (id: string | number) => void
  onClick?: (id: string | number) => void
}

export function TemplateCard({
  id,
  title,
  category,
  price,
  originalPrice,
  imageUrl,
  isFavourite = false,
  onFavouriteToggle,
  onClick,
}: TemplateCardProps) {
  return (
    <div
      onClick={() => onClick?.(id)}
      className="flex w-full cursor-pointer flex-col rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] xl:border xl:border-border xl:bg-card xl:shadow-none"
    >
      <div className="p-3.5 pb-0">
        <div
          className="relative w-full overflow-hidden rounded-xl bg-zinc-100"
          style={{ aspectRatio: "9 / 16" }}
        >
          <Image
            src={imageUrl}
            alt={title}
            fill
            quality={90}
            // Harus mengikuti lebar kartu sesungguhnya di tiap breakpoint grid
            // (2/3/4/6 kolom) — sizes yang lebih kecil dari render aktual bikin
            // Next.js minta gambar resolusi rendah lalu di-stretch → blur.
            sizes="(min-width: 1280px) 260px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 45vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 p-3.5 pt-3">
        <div className="flex items-start justify-between gap-2">
          <span className="truncate text-sm font-bold text-zinc-800 xl:text-base xl:font-medium xl:leading-6 xl:text-gray-950">
            {title}
          </span>

          <motion.button
            type="button"
            aria-label="Toggle favourite"
            onClick={(e) => {
              e.stopPropagation()
              onFavouriteToggle?.(id)
            }}
            whileTap={{ scale: 0.85 }}
            className="shrink-0 cursor-pointer"
          >
            <div
              className="flex items-center justify-center transition-all"
              style={{
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                background: isFavourite ? "var(--accent)" : "transparent",
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isFavourite ? "fav" : "unfav"}
                  initial={{ scale: 0.5, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <Heart
                    className={cn(
                      "transition-colors",
                      isFavourite
                        ? "fill-red-500 text-red-500"
                        : "text-zinc-300 hover:text-red-400"
                    )}
                    style={{ width: "20px", height: "20px" }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.button>
        </div>

        <span className="text-xs text-zinc-400 xl:text-sm xl:font-normal xl:leading-5 xl:text-muted-foreground">{category}</span>

        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-sm font-semibold text-primary xl:text-base xl:font-bold xl:leading-6 xl:text-violet-700">
            Rp {price.toLocaleString("id-ID")}
          </span>

          {!!originalPrice && (
            <span className="text-xs text-zinc-400 line-through xl:font-normal xl:leading-4 xl:text-muted-foreground">
              Rp {originalPrice.toLocaleString("id-ID")}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
