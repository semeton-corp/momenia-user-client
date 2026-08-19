"use client"

import * as React from "react"
import Image from "next/image"
import { useTranslations, useLocale } from "next-intl"
import { formatLabel } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { SortFilterDropdown, type SortFilterOption } from "@/components/dashboard/SortFilterDropdown"
import { StyleTag } from "@/components/dashboard/StyleTag"
import { TemplateCard } from "@/components/dashboard/TemplateCard"
import { TemplateCardSkeleton } from "@/components/dashboard/TemplateCardSkeleton"
import { TemplateDetailModal, type TemplateDetail } from "@/components/dashboard/TemplateDetailModal"
import { UnfavouriteConfirmDialog } from "@/components/dashboard/favourite/UnfavouriteConfirmDialog"
import {
  useFavouriteTemplates,
  useFavouriteTemplateTags,
  useInvitationTemplateDetail,
  useTemplateTagsByIds,
  useToggleFavourite,
} from "@/hooks/useInvitationTemplates"
import { templateCategoryName, type GetFavouritesParams, type TemplateDetailResponse } from "@/lib/api/invitation-template/invitation-template.types"
import EmptyFolderIllustration from "@/assets/empty-states/empty-folder.svg"

// Sama seperti dropdown sort di katalog utama dashboard: "Time/Price" + "Ascending/Descending".
const SORT_FIELD_OPTIONS: { value: NonNullable<GetFavouritesParams["sortField"]>; key: string }[] = [
  { value: "createdAt", key: "time" },
  { value: "price", key: "price" },
]
const SORT_ORDER_OPTIONS: { value: NonNullable<GetFavouritesParams["sortOrder"]>; key: string }[] = [
  { value: "asc", key: "ascending" },
  { value: "desc", key: "descending" },
]

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
    categoryLabel: formatLabel(data.category.name),
    tags: data.tags.map((t) => formatLabel(t.name)),
    price: parseFloat(data.priceAfterDiscount),
    originalPrice: data.price !== data.priceAfterDiscount ? parseFloat(data.price) : undefined,
    imageUrl: data.mobileThumbnail,
    desktopImageUrl: data.desktopThumbnail,
    description: locale === "id" ? data.descriptionIdn : data.descriptionEn,
  }
}

export default function FavouritePage() {
  const t = useTranslations("dashboard.favourite")
  const tBanner = useTranslations("dashboard.banner")
  const locale = useLocale()
  const [selectedTagId, setSelectedTagId] = React.useState<number | null>(null)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [sortField, setSortField] = React.useState<NonNullable<GetFavouritesParams["sortField"]>>("createdAt")
  const [sortOrder, setSortOrder] = React.useState<NonNullable<GetFavouritesParams["sortOrder"]>>("desc")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  // Item yang menunggu konfirmasi hapus dari favorit (null = dialog tertutup).
  const [pendingUnfav, setPendingUnfav] = React.useState<{ id: string; name: string } | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const { data: tags = [] } = useFavouriteTemplateTags()

  // Keyword & sort tetap server-side (endpoint mendukungnya). Filter tag TIDAK
  // dikirim ke server — backend bilang endpoint /favourites belum bisa filter tag,
  // jadi itu ditangani manual di bawah lewat useTemplateTagsByIds.
  const { data: favouritesData, isLoading, isError } = useFavouriteTemplates({
    pageSize: 100,
    sortField,
    sortOrder,
    keyword: debouncedSearch || undefined,
  })
  const { data: detailData, isLoading: isDetailLoading } = useInvitationTemplateDetail(selectedId)
  const { mutate: toggleFavourite } = useToggleFavourite()

  const realCards: FavCard[] = (favouritesData?.data ?? []).map((tpl) => ({
    id: tpl.id,
    name: tpl.name,
    category: formatLabel(templateCategoryName(tpl.category)),
    priceAfterDiscount: tpl.priceAfterDiscount,
    price: tpl.price,
    mobileThumbnail: tpl.mobileThumbnail,
    isUserFavorite: tpl.isUserFavorite,
  }))

  // Filter tag di FE: ambil detail (yang membawa `tags`) tiap kartu yang sedang
  // tampil, cuma waktu ada tag terpilih (biar tidak boros request pas "All saved").
  const isTagFilterActive = selectedTagId !== null
  const tagQueries = useTemplateTagsByIds(
    realCards.map((c) => c.id),
    isTagFilterActive,
  )
  const isTagFilterLoading = isTagFilterActive && tagQueries.some((q) => q.isLoading)
  const cards = isTagFilterActive
    ? realCards.filter((_, idx) => tagQueries[idx]?.data?.tags.some((tag) => tag.id === selectedTagId) ?? false)
    : realCards

  const selectedTemplate = detailData ? mapToTemplateDetail(detailData, locale) : null

  const handleFavouriteToggle = (id: string | number) => {
    const tpl = realCards.find((x) => x.id === String(id))
    if (!tpl) return
    // Di halaman favorit, semua kartu sudah favorit — jadi klik hati = niat hapus.
    // Minta konfirmasi lewat modal dulu, jangan langsung eksekusi.
    if (tpl.isUserFavorite) {
      setPendingUnfav({ id: tpl.id, name: tpl.name })
      return
    }
    toggleFavourite({ id: String(id), isFavourite: tpl.isUserFavorite })
  }

  const confirmUnfavourite = () => {
    if (!pendingUnfav) return
    toggleFavourite({ id: pendingUnfav.id, isFavourite: true })
    setPendingUnfav(null)
  }

  const sortFieldOptions: SortFilterOption[] = SORT_FIELD_OPTIONS.map((o) => ({
    value: o.value,
    label: tBanner(`sortFieldOptions.${o.key}`),
  }))
  const sortOrderOptions: SortFilterOption[] = SORT_ORDER_OPTIONS.map((o) => ({
    value: o.value,
    label: tBanner(`sortOrderOptions.${o.key}`),
  }))

  const sortControl = (triggerClassName: string) => (
    <SortFilterDropdown
      label={tBanner("sort")}
      title={tBanner("sortBy")}
      fieldValue={sortField}
      fieldOptions={sortFieldOptions}
      onFieldChange={(v) => setSortField(v as NonNullable<GetFavouritesParams["sortField"]>)}
      orderValue={sortOrder}
      orderOptions={sortOrderOptions}
      onOrderChange={(v) => setSortOrder(v as NonNullable<GetFavouritesParams["sortOrder"]>)}
      triggerClassName={triggerClassName}
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
          className="h-12 min-w-0 flex-1 rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm text-zinc-700 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-200"
        />
        {sortControl("h-12 w-[140px]")}
      </div>

      {/* ── Mobile: chips ── */}
      <div className="mt-[14px] -mx-5 overflow-x-auto pb-0.5 scrollbar-hide md:-mx-8 xl:hidden">
        <div className="flex w-max gap-2 px-5 md:px-8">
          <StyleTag label={t("chips.allSaved")} active={selectedTagId === null} onClick={() => setSelectedTagId(null)} />
          {tags.map((tag) => (
            <StyleTag
              key={tag.id}
              label={formatLabel(tag.name)}
              active={selectedTagId === tag.id}
              onClick={() => setSelectedTagId(tag.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Desktop: chips left + search/sort right ── */}
      <div className="mt-8 hidden items-center justify-between gap-4 xl:flex">
        <div className="flex flex-wrap items-center gap-3">
          <StyleTag label={t("chips.allSaved")} active={selectedTagId === null} onClick={() => setSelectedTagId(null)} />
          {tags.map((tag) => (
            <StyleTag
              key={tag.id}
              label={formatLabel(tag.name)}
              active={selectedTagId === tag.id}
              onClick={() => setSelectedTagId(tag.id)}
            />
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
        {isLoading || isTagFilterLoading ? (
          <div className={gridClass}>
            {Array.from({ length: 12 }).map((_, i) => (
              <TemplateCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-base text-zinc-400">{t("loadError")}</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="mx-auto flex w-full max-w-[448px] flex-col items-center gap-6 py-10 text-center">
            <Image src={EmptyFolderIllustration} alt="" className="h-[151px] w-[188px] xl:h-auto xl:w-64" priority />
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-gray-950 xl:text-2xl">{t("emptyTitle")}</h2>
              <p className="text-xs font-normal text-muted-foreground xl:text-base">{t("emptySubtitle")}</p>
            </div>
            <Button asChild className="h-12 rounded-xl px-6 text-sm font-medium xl:font-semibold">
              <Link href="/dashboard">{t("browseTemplates")}</Link>
            </Button>
          </div>
        ) : (
          <div className={gridClass}>
            {cards.map((tpl) => (
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

      <UnfavouriteConfirmDialog
        open={pendingUnfav !== null}
        onOpenChange={(open) => !open && setPendingUnfav(null)}
        onConfirm={confirmUnfavourite}
        templateName={pendingUnfav?.name}
      />
    </div>
  )
}
