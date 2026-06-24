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
  const [dummyFavourites, setDummyFavourites] = React.useState<Set<string>>(new Set())

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

  const DUMMY_TEMPLATES = [
    { id: "dummy-1", name: "Javanese Elegant", category: "Wedding", priceAfterDiscount: "70000", price: "140000", mobileThumbnail: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&q=80", isUserFavorite: false },
    { id: "dummy-2", name: "Modern Minimalist", category: "Wedding", priceAfterDiscount: "85000", price: "85000", mobileThumbnail: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80", isUserFavorite: true },
    { id: "dummy-3", name: "Rustic Garden", category: "Wedding", priceAfterDiscount: "65000", price: "130000", mobileThumbnail: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&q=80", isUserFavorite: false },
    { id: "dummy-4", name: "Royal Classic", category: "Wedding", priceAfterDiscount: "95000", price: "95000", mobileThumbnail: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&q=80", isUserFavorite: false },
    { id: "dummy-5", name: "Boho Chic", category: "Wedding", priceAfterDiscount: "75000", price: "150000", mobileThumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=80", isUserFavorite: true },
    { id: "dummy-6", name: "Floral Romance", category: "Wedding", priceAfterDiscount: "80000", price: "80000", mobileThumbnail: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&q=80", isUserFavorite: false },
    { id: "dummy-7", name: "Vintage Love", category: "Wedding", priceAfterDiscount: "70000", price: "140000", mobileThumbnail: "https://images.unsplash.com/photo-1470843810958-2da815d0e041?w=400&q=80", isUserFavorite: false },
    { id: "dummy-8", name: "Tropical Bliss", category: "Wedding", priceAfterDiscount: "60000", price: "120000", mobileThumbnail: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400&q=80", isUserFavorite: false },
    { id: "dummy-9", name: "Ethereal Dream", category: "Wedding", priceAfterDiscount: "90000", price: "180000", mobileThumbnail: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&q=80", isUserFavorite: true },
    { id: "dummy-10", name: "Dark Romance", category: "Wedding", priceAfterDiscount: "85000", price: "85000", mobileThumbnail: "https://images.unsplash.com/photo-1512485800893-b08ec1ea59b1?w=400&q=80", isUserFavorite: false },
    { id: "dummy-11", name: "Sakura Blossom", category: "Wedding", priceAfterDiscount: "75000", price: "150000", mobileThumbnail: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=400&q=80", isUserFavorite: false },
  ]

  const apiTemplates = templatesData?.data ?? []
  const templates = [...apiTemplates, ...DUMMY_TEMPLATES.slice(0, Math.max(0, 11 - apiTemplates.length + 1))]
  const selectedTemplate = detailData ? mapToTemplateDetail(detailData, locale) : null

  const handleFavouriteToggle = (id: string | number) => {
    const strId = String(id)
    if (strId.startsWith("dummy-")) {
      setDummyFavourites((prev) => {
        const next = new Set(prev)
        next.has(strId) ? next.delete(strId) : next.add(strId)
        return next
      })
      return
    }
    const template = apiTemplates.find((tpl) => tpl.id === strId)
    if (!template) return
    toggleFavourite({ id: strId, isFavourite: template.isUserFavorite })
  }

  return (
    <div className="px-5 md:px-8 xl:px-16">
      <DashboardBanner search={search} onSearchChange={setSearch} />

      {/* Style Tags */}
      <div className="mt-6 mb-0 overflow-x-auto pb-1 scrollbar-hide md:mt-10 md:mb-[44px]">
        <div className="mx-auto flex w-max items-center gap-[14px]">
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
          className="mt-6 grid w-full grid-cols-2 gap-x-4 gap-y-6 md:mt-8 md:grid-cols-3 md:gap-x-6 md:gap-y-7 lg:grid-cols-4 xl:grid-cols-[repeat(6,minmax(0,1fr))] xl:gap-7"
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
                  isFavourite={String(template.id).startsWith("dummy-") ? dummyFavourites.has(String(template.id)) : (template.isUserFavorite ?? false)}
                  onFavouriteToggle={handleFavouriteToggle}
                  onClick={String(template.id).startsWith("dummy-") ? undefined : (id) => setSelectedId(String(id))}
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
