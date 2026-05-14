"use client"

import Image from "next/image"
import { Heart } from "lucide-react"

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
      className="flex w-full cursor-pointer flex-col rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
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
            sizes="196px"
            className="object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 p-3.5 pt-3">
        <div className="flex items-start justify-between gap-2">
          <span className="truncate text-sm font-bold text-zinc-800">
            {title}
          </span>

          <button
            type="button"
            aria-label="Toggle favourite"
            onClick={(e) => {
              e.stopPropagation()
              onFavouriteToggle?.(id)
            }}
            className="shrink-0"
          >
            <Heart
              className={cn(
                "h-4.5 w-4.5 transition-colors",
                isFavourite
                  ? "fill-red-500 text-red-500"
                  : "text-zinc-300 hover:text-red-400"
              )}
            />
          </button>
        </div>

        <span className="text-xs text-zinc-400">{category}</span>

        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-sm font-semibold text-primary">
            Rp {price.toLocaleString("id-ID")}
          </span>

          {!!originalPrice && (
            <span className="text-xs text-zinc-400 line-through">
              Rp {originalPrice.toLocaleString("id-ID")}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
