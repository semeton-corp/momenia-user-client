"use client"

import * as React from "react"
import { useTranslations, useLocale } from "next-intl"
import { TemplateCard } from "@/components/dashboard/TemplateCard"
import { TemplateDetailModal, type TemplateDetail } from "@/components/dashboard/TemplateDetailModal"
import { useFavouriteTemplates, useInvitationTemplateDetail, useToggleFavourite } from "@/hooks/useInvitationTemplates"
import type { TemplateDetailResponse } from "@/lib/api/invitation-template/invitation-template.types"

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
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  const { data: favouritesData, isLoading } = useFavouriteTemplates({ pageSize: 20 })
  const { data: detailData, isLoading: isDetailLoading } = useInvitationTemplateDetail(selectedId)
  const { mutate: toggleFavourite } = useToggleFavourite()

  const templates = favouritesData?.data ?? []
  const selectedTemplate = detailData ? mapToTemplateDetail(detailData, locale) : null

  const handleFavouriteToggle = (id: string | number) => {
    const template = templates.find((tpl) => tpl.id === String(id))
    if (!template) return
    toggleFavourite({ id: String(id), isFavourite: template.isUserFavorite })
  }

  return (
    <div className="p-5 md:p-8">
      <h1 className="mb-8 text-2xl font-bold text-zinc-900">{t("title")}</h1>

      {isLoading ? (
        <div
          className="mx-auto grid w-full max-w-345 gap-x-6 gap-y-7"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(196px, 1fr))" }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-full animate-pulse rounded-2xl bg-zinc-100" style={{ aspectRatio: "9 / 16" }} />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-base text-zinc-400">{t("empty")}</p>
        </div>
      ) : (
        <div
          className="mx-auto grid w-full max-w-345 gap-x-6 gap-y-7"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(196px, 1fr))" }}
        >
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              id={template.id}
              title={template.name}
              category={template.category}
              price={parseFloat(template.priceAfterDiscount)}
              originalPrice={template.price !== template.priceAfterDiscount ? parseFloat(template.price) : undefined}
              imageUrl={template.mobileThumbnail}
              isFavourite={template.isUserFavorite}
              onFavouriteToggle={handleFavouriteToggle}
              onClick={(id) => setSelectedId(String(id))}
            />
          ))}
        </div>
      )}

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
