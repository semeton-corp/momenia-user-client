"use client"

import * as React from "react"
import { useTranslations, useLocale } from "next-intl"
import { DashboardBanner } from "@/components/dashboard/DashboardBanner"
import { StyleTag } from "@/components/dashboard/StyleTag"
import { TemplateCard } from "@/components/dashboard/TemplateCard"
import { TemplateDetailModal, type TemplateDetail } from "@/components/dashboard/TemplateDetailModal"
import { useInvitationTemplates, useInvitationTemplateDetail, useToggleFavourite } from "@/hooks/useInvitationTemplates"
import type { TemplateDetailResponse } from "@/lib/api/invitation-template/invitation-template.types"

const STYLE_TAG_KEYS = [
  "allStyles", "classy", "minimalism", "colorful", "modern",
  "vintage", "clean", "bold", "retro", "cute", "softColor",
] as const

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

export default function DashboardPage() {
  const t = useTranslations("dashboard.tags")
  const locale = useLocale()
  const [activeTagKey, setActiveTagKey] = React.useState<typeof STYLE_TAG_KEYS[number]>("allStyles")
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const { data: templatesData, isLoading, isError } = useInvitationTemplates({
    pageSize: 20,
    keyword: debouncedSearch || undefined,
  })

  const { data: detailData, isLoading: isDetailLoading } = useInvitationTemplateDetail(selectedId)
  const { mutate: toggleFavourite } = useToggleFavourite()

  const templates = templatesData?.data ?? []
  const selectedTemplate = detailData ? mapToTemplateDetail(detailData, locale) : null

  const handleFavouriteToggle = (id: string | number) => {
    const template = templates.find((tpl) => tpl.id === String(id))
    if (!template) return
    toggleFavourite({ id: String(id), isFavourite: template.isUserFavorite })
  }

  return (
    <div className="p-5 md:p-8">
      <DashboardBanner search={search} onSearchChange={setSearch} />

      {/* Style Tags */}
      <div className="mt-10 mb-2 overflow-x-auto pb-1 scrollbar-hide">
        <div className="mx-auto flex w-max items-center gap-2">
          {STYLE_TAG_KEYS.map((key) => (
            <StyleTag
              key={key}
              label={t(key)}
              active={activeTagKey === key}
              onClick={() => setActiveTagKey(key)}
            />
          ))}
        </div>
      </div>

      {/* Template Grid */}
      {isError ? (
        <div className="mt-8 flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-zinc-400">Gagal memuat template. Periksa koneksi atau konfigurasi API.</p>
        </div>
      ) : (
        <div
          className="mt-8 mx-auto grid w-full max-w-345 gap-x-6 gap-y-7"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(196px, 1fr))" }}
        >
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-full animate-pulse rounded-2xl bg-zinc-100" style={{ aspectRatio: "9 / 16" }} />
              ))
            : templates.map((template) => (
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
