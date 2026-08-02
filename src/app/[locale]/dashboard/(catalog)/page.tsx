"use client"

import * as React from "react"
import Image from "next/image"
import { useTranslations, useLocale } from "next-intl"
import { DashboardBanner } from "@/components/dashboard/DashboardBanner"
import { DragScrollRow } from "@/components/dashboard/DragScrollRow"
import { StyleTag } from "@/components/dashboard/StyleTag"
import { TemplateCard } from "@/components/dashboard/TemplateCard"
import { TemplateDetailModal, type TemplateDetail } from "@/components/dashboard/TemplateDetailModal"
import { useInvitationTemplateCategories, useInvitationTemplateDetail, useInvitationTemplateTags, useInvitationTemplates, useToggleFavourite } from "@/hooks/useInvitationTemplates"
import { templateCategoryName, type GetTemplatesParams, type TemplateDetailResponse } from "@/lib/api/invitation-template/invitation-template.types"
import { useAuthGate } from "@/components/dashboard/DashboardAuthGate"
import { useCurrentUser } from "@/hooks/auth/useCurrentUser"
import { formatLabel } from "@/lib/utils"
import EmptyFolderIllustration from "@/assets/empty-states/empty-folder.svg"

const ALL_STYLES_ID = "all"
const ALL_CATEGORIES = ""

const SORT_FIELD_OPTIONS: { value: NonNullable<GetTemplatesParams["sortField"]>; key: string }[] = [
  { value: "createdAt", key: "time" },
  { value: "price", key: "price" },
]
const SORT_ORDER_OPTIONS: { value: NonNullable<GetTemplatesParams["sortOrder"]>; key: string }[] = [
  { value: "asc", key: "ascending" },
  { value: "desc", key: "descending" },
]
const DEFAULT_SORT_FIELD: NonNullable<GetTemplatesParams["sortField"]> = "createdAt"
const DEFAULT_SORT_ORDER: NonNullable<GetTemplatesParams["sortOrder"]> = "desc"

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

export default function DashboardPage() {
  const t = useTranslations("dashboard.tags")
  const tBanner = useTranslations("dashboard.banner")
  const locale = useLocale()
  // Kosong = "All styles". Bisa pilih lebih dari satu tag sekaligus (mis. mantap + jos).
  const [selectedTagIds, setSelectedTagIds] = React.useState<number[]>([])
  const [selectedCategory, setSelectedCategory] = React.useState<string>(ALL_CATEGORIES)
  const [sortField, setSortField] = React.useState<NonNullable<GetTemplatesParams["sortField"]>>(DEFAULT_SORT_FIELD)
  const [sortOrder, setSortOrder] = React.useState<NonNullable<GetTemplatesParams["sortOrder"]>>(DEFAULT_SORT_ORDER)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [dummyFavourites, setDummyFavourites] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  // Toggle satu tag: kalau sudah aktif dilepas, kalau belum ditambahkan. Array kosong
  // otomatis berarti kembali ke "All styles".
  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    )
  }

  const { data: templateTags = [], isLoading: isTagsLoading } = useInvitationTemplateTags()
  const { data: templateCategories = [] } = useInvitationTemplateCategories()

  const categoryOptions = [
    { value: ALL_CATEGORIES, label: tBanner("allCategories") },
    ...templateCategories.map((c) => ({ value: String(c.id), label: formatLabel(c.name) })),
  ]
  const sortFieldOptions = SORT_FIELD_OPTIONS.map((o) => ({ value: o.value, label: tBanner(`sortFieldOptions.${o.key}`) }))
  const sortOrderOptions = SORT_ORDER_OPTIONS.map((o) => ({ value: o.value, label: tBanner(`sortOrderOptions.${o.key}`) }))

  const { data: templatesData, isLoading, isError } = useInvitationTemplates({
    pageSize: 20,
    keyword: debouncedSearch || undefined,
    tagsIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
    categoryId: selectedCategory ? Number(selectedCategory) : undefined,
    sortField,
    sortOrder,
  })

  const { data: detailData, isLoading: isDetailLoading } = useInvitationTemplateDetail(selectedId)
  const { mutate: toggleFavourite } = useToggleFavourite()
  const { isLoggedIn } = useCurrentUser()
  const { requestAccess } = useAuthGate()

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
  const shouldUseDummyTemplates =
    apiTemplates.length === 0 && !debouncedSearch && selectedTagIds.length === 0 && !selectedCategory
  const templates = shouldUseDummyTemplates
    ? [...apiTemplates, ...DUMMY_TEMPLATES.slice(0, Math.max(0, 11 - apiTemplates.length + 1))]
    : apiTemplates
  const hasTemplates = templates.length > 0
  const selectedTemplate = detailData ? mapToTemplateDetail(detailData, locale) : null

  const handleFavouriteToggle = (id: string | number) => {
    if (!isLoggedIn) {
      requestAccess()
      return
    }
    const strId = String(id)
    if (strId.startsWith("dummy-")) {
      setDummyFavourites((prev) => {
        const next = new Set(prev)
        if (next.has(strId)) next.delete(strId)
        else next.add(strId)
        return next
      })
      return
    }
    const template = apiTemplates.find((tpl) => tpl.id === strId)
    if (!template) return
    toggleFavourite({ id: strId, isFavourite: template.isUserFavorite })
  }

  return (
    <div className="px-5 md:px-8 xl:mx-auto xl:max-w-[1824px] xl:px-16 xl:pb-10">
      <DashboardBanner
        search={search}
        onSearchChange={setSearch}
        categoryOptions={categoryOptions}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortFieldOptions={sortFieldOptions}
        selectedSortField={sortField}
        onSortFieldChange={(v) => setSortField(v as NonNullable<GetTemplatesParams["sortField"]>)}
        sortOrderOptions={sortOrderOptions}
        selectedSortOrder={sortOrder}
        onSortOrderChange={(v) => setSortOrder(v as NonNullable<GetTemplatesParams["sortOrder"]>)}
      />

        {/* Style Tags */}
        <DragScrollRow className="mt-6 mb-0 -mx-5 md:-mx-8 md:mt-10 md:mb-[44px] xl:mx-auto xl:max-w-[1321px]" innerClassName="pb-1">
          <div className="flex w-max items-center gap-[14px] px-5 md:px-8 xl:mx-auto xl:px-0">
            {isTagsLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[35px] w-24 shrink-0 animate-pulse rounded-[30px] bg-zinc-100"
                />
              ))
            ) : (
              <>
                <StyleTag
                  key={ALL_STYLES_ID}
                  label={t("allStyles")}
                  active={selectedTagIds.length === 0}
                  onClick={() => setSelectedTagIds([])}
                />
                {templateTags.map((tag) => (
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

      {/* Template Grid */}
      {isError ? (
        <div className="mt-8 flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-zinc-400">Gagal memuat template. Periksa koneksi atau konfigurasi API.</p>
        </div>
      ) : !isLoading && !hasTemplates ? (
        <div className="mx-auto mt-8 flex w-full max-w-[448px] flex-col items-center gap-6 py-10 text-center">
          <Image src={EmptyFolderIllustration} alt="" className="h-[151px] w-[188px] xl:h-auto xl:w-64" priority />
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-gray-950 xl:text-2xl">{t("emptyTitle")}</h2>
            <p className="text-xs font-normal text-muted-foreground xl:text-base">{t("emptySubtitle")}</p>
          </div>
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
                  category={formatLabel(templateCategoryName(template.category))}
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
