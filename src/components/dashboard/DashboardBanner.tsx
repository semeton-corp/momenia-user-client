"use client"

import Image from "next/image"
import { Search, ArrowDownAZ, ChevronDown, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
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

  const categoryDropdown = (
    <BannerFilterDropdown
      icon={<ChevronDown className="hidden h-4 w-4 shrink-0 md:block md:h-5 md:w-5" />}
      label={t("category")}
      value={selectedCategory}
      options={categoryOptions}
      onChange={onCategoryChange}
      triggerClassName="h-10 w-[80px] md:h-13 md:w-[150px] xl:h-[66px] xl:w-[176px]"
    />
  )

  const sortDropdown = (
    <BannerFilterDropdown
      icon={<ArrowDownAZ className="h-4 w-4 shrink-0 md:h-5 md:w-5" />}
      label={t("sort")}
      value={selectedSort}
      options={sortOptions}
      onChange={onSortChange}
      triggerClassName="h-10 w-[84px] md:h-13 md:w-[150px] xl:h-[66px] xl:w-[176px]"
    />
  )

  return (
    <div className="mx-auto mt-2 mb-6 w-full max-w-345 md:my-0 xl:mt-14 xl:mb-11 xl:w-[1321px] xl:max-w-none">
      <div
        className="relative w-full rounded-3xl p-[18px] md:rounded-[36px] md:px-14 md:py-12 xl:flex xl:h-[301px] xl:items-center xl:justify-center xl:px-0 xl:py-0"
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
          {/* Search input — flex-1 supaya memanjang mengisi sisa ruang, jadi jarak ke
              kedua dropdown seragam dan tidak ada ruang kosong di kanan. */}
          <div className="relative flex-1">
            {/* Ikon cari selalu di kanan — sembunyikan saat ada input supaya
                tidak bentrok dengan tombol silang. */}
            <Search
              className={cn(
                "absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground md:right-4 md:h-5 md:w-5 xl:right-6",
                search && "hidden",
              )}
            />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 w-full rounded-xl border bg-[var(--background)] pl-3 pr-10 text-xs text-[#737373] placeholder:text-[#737373] outline-none focus:ring-2 focus:ring-indigo-300 md:h-13 md:pl-4 md:pr-12 md:text-base xl:h-[66px] xl:rounded-2xl xl:bg-indigo-50 xl:pl-8 xl:pr-16 xl:text-base xl:font-normal xl:text-foreground xl:placeholder:text-zinc-400"
              style={{ borderColor: "var(--background)" }}
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 md:right-4 xl:right-6"
              >
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            )}
          </div>

          {/* Kategori & Urutan: di desktop tampil di baris ini juga (di dalam
              banner), di mobile disembunyikan — dipindah ke luar/di bawah
              banner lewat blok terpisah di bawah. */}
          <div className="hidden md:contents">
            {categoryDropdown}
            {sortDropdown}
          </div>
        </div>
      </div>
    </div>

    {/* Kategori & Urutan versi mobile — di luar container banner, melebar penuh
        rata kiri-kanan (flex-1 masing-masing) dengan konten di-center */}
    <div className="mt-3 flex items-center gap-2 md:hidden">
      <BannerFilterDropdown
        icon={<ChevronDown className="h-4 w-4 shrink-0" />}
        label={t("category")}
        value={selectedCategory}
        options={categoryOptions}
        onChange={onCategoryChange}
        centerContent
        triggerClassName="h-10"
      />
      <BannerFilterDropdown
        icon={<ArrowDownAZ className="h-4 w-4 shrink-0" />}
        label={t("sort")}
        value={selectedSort}
        options={sortOptions}
        onChange={onSortChange}
        centerContent
        triggerClassName="h-10"
      />
    </div>
    </div>
  )
}
