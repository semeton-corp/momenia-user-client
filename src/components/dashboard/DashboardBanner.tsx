"use client"

import Image from "next/image"
import { Search, ArrowDownAZ, ChevronDown } from "lucide-react"
import { useTranslations } from "next-intl"
import Ambient from "@/assets/llandingpage/banner-create-now.svg"
import { BannerFilterDropdown, type BannerFilterOption } from "./BannerFilterDropdown"

type DashboardBannerProps = {
  search: string
  onSearchChange: (value: string) => void
  categoryOptions: BannerFilterOption[]
  selectedCategory: string
  onCategoryChange: (value: string) => void
  sortOptions: BannerFilterOption[]
  selectedSort: string
  onSortChange: (value: string) => void
}

export function DashboardBanner({
  search,
  onSearchChange,
  categoryOptions,
  selectedCategory,
  onCategoryChange,
  sortOptions,
  selectedSort,
  onSortChange,
}: DashboardBannerProps) {
  const t = useTranslations("dashboard.banner")

  return (
    <div
      className="relative mx-auto mt-2 mb-6 w-full max-w-345 rounded-3xl p-[18px] md:my-0 md:rounded-4xl md:px-14 md:py-12 xl:mt-14 xl:mb-11 xl:flex xl:h-[301px] xl:w-[1321px] xl:max-w-none xl:items-center xl:justify-center xl:rounded-[24px] xl:px-0 xl:py-0"
      style={{
        background:
          "linear-gradient(to top, #4F46E5 0%, #6366F1 44%, #A5B4FC 100%)",
      }}
    >
      {/* Ambient blobs — dibungkus layer clip sendiri supaya dropdown tidak ke-clip banner */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <div className="absolute inset-y-0 left-0 w-[35%] opacity-60">
          <Image src={Ambient} alt="" fill className="object-contain object-bottom-right scale-x-[-1]" priority />
        </div>
        <div className="absolute inset-y-0 right-0 w-[35%] opacity-60">
          <Image src={Ambient} alt="" fill className="object-contain object-bottom-right" priority />
        </div>
      </div>

      {/* Konten */}
      <div className="relative z-10 flex w-full flex-col items-center gap-3 text-center text-white md:gap-8 xl:gap-6">
        <div>
          <h1
            className="text-xl font-semibold leading-7 md:text-4xl md:leading-tight xl:text-5xl xl:font-semibold"
            style={{ color: "var(--popover)" }}
          >
            {t("title")}
          </h1>
          <p className="mt-2 hidden text-base font-normal text-white/80 md:text-lg xl:block xl:text-lg xl:font-normal">
            {t("subtitle")}
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex w-full max-w-6xl mx-auto items-center gap-2 md:gap-3 xl:gap-4">
          {/* Search input */}
          <div className="relative flex-1 xl:flex-none xl:w-[845px]">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 md:left-4 md:right-auto md:h-5 md:w-5 xl:left-8" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 w-full rounded-xl border bg-[var(--background)] pl-3 pr-9 text-xs text-[#737373] placeholder:text-[#737373] outline-none focus:ring-2 focus:ring-indigo-300 md:h-13 md:pl-12 md:pr-4 md:text-base xl:h-[66px] xl:rounded-2xl xl:bg-indigo-50 xl:pl-[68px] xl:pr-8 xl:text-base xl:font-normal xl:text-foreground xl:placeholder:text-zinc-400"
              style={{ borderColor: "var(--background)" }}
            />
          </div>

          {/* Category */}
          <BannerFilterDropdown
            icon={<ChevronDown className="hidden h-4 w-4 md:block md:h-5 md:w-5" />}
            label={t("category")}
            value={selectedCategory}
            options={categoryOptions}
            onChange={onCategoryChange}
            triggerClassName="h-10 w-[78px] md:h-13 md:w-36 xl:h-[66px] xl:w-[140px]"
          />

          {/* Sort */}
          <BannerFilterDropdown
            icon={<ArrowDownAZ className="h-4 w-4 md:h-5 md:w-5" />}
            label={t("sort")}
            value={selectedSort}
            options={sortOptions}
            onChange={onSortChange}
            triggerClassName="h-10 w-[69px] md:h-13 md:w-36 xl:h-[66px] xl:w-[140px]"
          />
        </div>
      </div>
    </div>
  )
}
