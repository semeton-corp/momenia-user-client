"use client"

import * as React from "react"
import Image from "next/image"
import { useTranslations, useLocale } from "next-intl"
import { formatLabel } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { DragScrollRow } from "@/components/dashboard/DragScrollRow"
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
import { templateCategoryName, type TemplateDetailResponse } from "@/lib/api/invitation-template/invitation-template.types"
import EmptyFolderIllustration from "@/assets/empty-states/empty-folder.svg"

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
     // Needed by the modal's Demo button to render the template.
    template: data.template,
  }
}

export default function FavouritePage() {
  const t = useTranslations("dashboard.favourite")
  const locale = useLocale()
  // Kosong = "All saved". Bisa pilih lebih dari satu tag sekaligus, sama seperti
  // Style Tags di katalog utama dashboard.
  const [selectedTagIds, setSelectedTagIds] = React.useState<number[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  // Item yang menunggu konfirmasi hapus dari favorit (null = dialog tertutup).
  const [pendingUnfav, setPendingUnfav] = React.useState<{ id: string; name: string } | null>(null)

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const { data: tags = [], isLoading: isTagsLoading } = useFavouriteTemplateTags()

  // Tidak ada search/sort lagi di UI — selalu diurutkan berdasarkan kapan
  // di-favoritkan, terbaru duluan. Filter tag TIDAK dikirim ke server — backend
  // bilang endpoint /favourites belum bisa filter tag, jadi itu ditangani manual
  // di bawah lewat useTemplateTagsByIds.
  const { data: favouritesData, isLoading, isError } = useFavouriteTemplates({
    pageSize: 100,
    sortField: "createdAt",
    sortOrder: "desc",
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
  // Kartu ikut tampil kalau tag-nya cocok SALAH SATU dari tag yang dipilih (OR),
  // sama seperti filter multi-tag di katalog utama dashboard.
  const isTagFilterActive = selectedTagIds.length > 0
  const tagQueries = useTemplateTagsByIds(
    realCards.map((c) => c.id),
    isTagFilterActive,
  )
  const isTagFilterLoading = isTagFilterActive && tagQueries.some((q) => q.isLoading)
  const cards = isTagFilterActive
    ? realCards.filter((_, idx) => tagQueries[idx]?.data?.tags.some((tag) => selectedTagIds.includes(tag.id)) ?? false)
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

      {/* ── Style Tags ── */}
      {/* Satu DragScrollRow buat semua breakpoint, persis pola Style Tags di
          katalog utama dashboard (fade putih di tepi + drag-scroll), dan bisa
          pilih lebih dari satu tag sekaligus. Tanpa search/sort lagi — card
          selalu terurut dari yang paling baru di-favoritkan. */}
      <DragScrollRow className="mt-6 -mx-5 md:-mx-8 xl:mx-0 xl:mt-8" innerClassName="pb-1">
        <div className="flex w-max items-center gap-[14px] px-5 md:px-8 xl:px-0">
          {isTagsLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[35px] w-24 shrink-0 animate-pulse rounded-[30px] bg-zinc-100" />
            ))
          ) : (
            <>
              <StyleTag label={t("chips.allSaved")} active={selectedTagIds.length === 0} onClick={() => setSelectedTagIds([])} />
              {tags.map((tag) => (
                <StyleTag
                  key={tag.id}
                  label={formatLabel(tag.name)}
                  active={selectedTagIds.includes(tag.id)}
                  onClick={() => toggleTag(tag.id)}
                />
              ))}
            </>
          )}
        </div>
      </DragScrollRow>

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
