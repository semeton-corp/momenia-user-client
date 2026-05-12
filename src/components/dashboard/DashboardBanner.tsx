"use client"

import Image from "next/image"
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react"
import { useTranslations } from "next-intl"
import Ambient from "@/assets/llandingpage/banner-create-now.svg"

type DashboardBannerProps = {
  search: string
  onSearchChange: (value: string) => void
  onCategory?: () => void
  onSort?: () => void
}

export function DashboardBanner({ search, onSearchChange, onCategory, onSort }: DashboardBannerProps) {
  const t = useTranslations("dashboard.banner")

  return (
    <div
      className="relative mx-auto w-full max-w-345 overflow-hidden rounded-3xl px-8 py-10 md:rounded-4xl md:px-14 md:py-12"
      style={{
        background:
          "linear-gradient(to top, #312E81 0%, #4F46E5 27%, #6366F1 44%, #A5B4FC 74%, #DDD6FE 100%)",
      }}
    >
      {/* Ambient — kiri */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[35%] opacity-60">
        <Image src={Ambient} alt="" fill className="object-contain object-bottom-right scale-x-[-1]" priority />
      </div>

      {/* Ambient — kanan */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[35%] opacity-60">
        <Image src={Ambient} alt="" fill className="object-contain object-bottom-right" priority />
      </div>

      {/* Konten */}
      <div className="relative z-10 flex flex-col items-center gap-8 text-center text-white">
        <div>
          <h1 className="text-2xl font-semibold md:text-4xl">{t("title")}</h1>
          <p className="mt-2 text-base font-normal text-white/80 md:text-lg">{t("subtitle")}</p>
        </div>

        {/* Search + Buttons */}
        <div className="flex w-full max-w-6xl mx-auto items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-13 w-full rounded-xl bg-white pl-12 pr-4 text-base text-zinc-700 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <button
            onClick={onCategory}
            type="button"
            className="flex h-13 w-36 shrink-0 items-center justify-center gap-2 rounded-xl bg-white text-base font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <ChevronDown className="h-5 w-5" />
            {t("category")}
          </button>
          <button
            onClick={onSort}
            type="button"
            className="flex h-13 w-36 shrink-0 items-center justify-center gap-2 rounded-xl bg-white text-base font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <SlidersHorizontal className="h-5 w-5" />
            {t("sort")}
          </button>
        </div>
      </div>
    </div>
  )
}
