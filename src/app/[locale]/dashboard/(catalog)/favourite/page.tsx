"use client"

import * as React from "react"
import { useTranslations, useLocale } from "next-intl"
import { cn } from "@/lib/utils"
import { SortDropdown } from "@/components/dashboard/SortDropdown"
import { StyleTag } from "@/components/dashboard/StyleTag"
import { TemplateCard } from "@/components/dashboard/TemplateCard"
import { TemplateDetailModal, type TemplateDetail } from "@/components/dashboard/TemplateDetailModal"
import { useFavouriteTemplates, useInvitationTemplateDetail, useToggleFavourite } from "@/hooks/useInvitationTemplates"
import type { TemplateDetailResponse } from "@/lib/api/invitation-template/invitation-template.types"

type ChipKey = "allSaved" | "wedding" | "modern" | "classic" | "recentlyAdded"
const CHIPS: ChipKey[] = ["allSaved", "wedding", "modern", "classic", "recentlyAdded"]
const CATEGORY_CHIPS: ChipKey[] = ["wedding", "modern", "classic"]

type SortKey = "recent" | "priceLow" | "priceHigh"
const SORTS: SortKey[] = ["recent", "priceLow", "priceHigh"]

type FavCard = {
  id: string
  name: string
  category: string
  priceAfterDiscount: string
  price: string
  mobileThumbnail: string
  isUserFavorite: boolean
}

function mapToTemplateDetail(data: TemplateDetailResponse, locale: string): TemplateDetail {
  return {
    id: data.id,
    title: data.name,
    categoryLabel: data.category.name,
    tags: data.tags.map((t) => t.name),
    rating: 5,
    reviewCount: 0,
    price: parseFloat(data.priceAfterDiscount),
    originalPrice: data.price !== data.priceAfterDiscount ? parseFloat(data.price) : undefined,
    imageUrl: data.mobileThumbnail,
    description: locale === "id" ? data.descriptionIdn : data.descriptionEn,
  }
}

export default function FavouritePage() {
  const t = useTranslations("dashboard.favourite")
  const locale = useLocale()
  const [chip, setChip] = React.useState<ChipKey>("allSaved")
  const [search, setSearch] = React.useState("")
  const [sort, setSort] = React.useState<SortKey>("recent")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  // List tidak membawa createdAt, jadi "Most recent" cuma bisa diwujudkan lewat
  // sortOrder di API (bukan sort client-side seperti harga).
  const { data: favouritesData, isLoading, isError } = useFavouriteTemplates({
    pageSize: 20,
    sortOrder: sort === "recent" ? "desc" : undefined,
  })
  const { data: detailData, isLoading: isDetailLoading } = useInvitationTemplateDetail(selectedId)
  const { mutate: toggleFavourite } = useToggleFavourite()

  const realCards: FavCard[] = (favouritesData?.data ?? []).map((tpl) => ({
    id: tpl.id,
    name: tpl.name,
    category: tpl.category,
    priceAfterDiscount: tpl.priceAfterDiscount,
    price: tpl.price,
    mobileThumbnail: tpl.mobileThumbnail,
    isUserFavorite: tpl.isUserFavorite,
  }))

  const q = search.trim().toLowerCase()
  const filtered = realCards
    .filter((tpl) => {
      const okChip = !CATEGORY_CHIPS.includes(chip) || tpl.category.toLowerCase().includes(chip)
      const okSearch = !q || tpl.name.toLowerCase().includes(q)
      return okChip && okSearch
    })
    .sort((a, b) => {
      if (sort === "priceLow") return parseFloat(a.priceAfterDiscount) - parseFloat(b.priceAfterDiscount)
      if (sort === "priceHigh") return parseFloat(b.priceAfterDiscount) - parseFloat(a.priceAfterDiscount)
      return 0
    })

  const selectedTemplate = detailData ? mapToTemplateDetail(detailData, locale) : null

  const handleFavouriteToggle = (id: string | number) => {
    const tpl = realCards.find((x) => x.id === String(id))
    if (!tpl) return
    toggleFavourite({ id: String(id), isFavourite: tpl.isUserFavorite })
  }

  const sortControl = (sizeClass: string) => (
    <SortDropdown
      value={sort}
      onChange={(v) => setSort(v as SortKey)}
      options={SORTS.map((s) => ({ value: s, label: t(`sort.${s}`) }))}
      className={cn("shrink-0", sizeClass)}
    />
  )

  const gridClass =
    "grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-x-6 md:gap-y-7 lg:grid-cols-4 xl:grid-cols-[repeat(6,minmax(0,1fr))] xl:gap-7"

  return (
    <div className="px-5 pt-2 md:px-8 xl:mx-auto xl:max-w-[1824px] xl:px-16 xl:pb-10 xl:pt-[72px]">
      {/* ── Header ── */}
      <header className="space-y-1.5 xl:space-y-3">
        <h1 className="text-[28px] font-semibold text-[#111111] xl:text-[48px] xl:leading-[48px]">
          {t("title")}
        </h1>
        <p className="hidden text-base text-zinc-500 xl:block xl:text-lg xl:font-normal">{t("subtitle")}</p>
        <p className="text-sm font-normal text-zinc-500 xl:hidden">{t("subtitleShort")}</p>
      </header>

      {/* ── Mobile: search + sort ── */}
      <div className="mt-[14px] flex items-center gap-3 xl:hidden">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search")}
          className="h-12 flex-1 rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm text-zinc-700 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-200"
        />
        {sortControl("h-12 w-[140px]")}
      </div>

      {/* ── Mobile: chips ── */}
      <div className="mt-[14px] -mx-5 overflow-x-auto pb-0.5 scrollbar-hide md:-mx-8 xl:hidden">
        <div className="flex w-max gap-2 px-5 md:px-8">
          {CHIPS.map((c) => (
            <StyleTag key={c} label={t(`chips.${c}`)} active={chip === c} onClick={() => setChip(c)} />
          ))}
        </div>
      </div>

      {/* ── Desktop: chips left + search/sort right ── */}
      <div className="mt-8 hidden items-center justify-between gap-4 xl:flex">
        <div className="flex items-center gap-3">
          {CHIPS.map((c) => (
            <StyleTag key={c} label={t(`chips.${c}`)} active={chip === c} onClick={() => setChip(c)} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
            className="h-[56px] w-[420px] rounded-lg border border-[#E5E7EB] bg-white px-4 text-base font-normal text-zinc-700 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-200"
          />
          {sortControl("h-[56px] w-[180px]")}
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="mt-6 xl:mt-8">
        {isLoading ? (
          <div className={gridClass}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-full animate-pulse rounded-2xl bg-zinc-100" style={{ aspectRatio: "9 / 16" }} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-base text-zinc-400">{t("loadError")}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-base text-zinc-400">{t("empty")}</p>
          </div>
        ) : (
          <div className={gridClass}>
            {filtered.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                id={tpl.id}
                title={tpl.name}
                category={tpl.category}
                price={parseFloat(tpl.priceAfterDiscount)}
                originalPrice={tpl.price !== tpl.priceAfterDiscount ? parseFloat(tpl.price) : undefined}
                imageUrl={tpl.mobileThumbnail}
                isFavourite={tpl.isUserFavorite}
                onFavouriteToggle={handleFavouriteToggle}
                onClick={(id) => setSelectedId(String(id))}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail loading spinner */}
      {isDetailLoading && (
        <div
          className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/30"
          onClick={() => setSelectedId(null)}
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      )}

      <TemplateDetailModal
        template={selectedTemplate}
        isFavourite={selectedTemplate !== null && (detailData?.isUserFavorite ?? false)}
        onFavouriteToggle={handleFavouriteToggle}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}
