"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { DashboardBanner } from "@/components/dashboard/DashboardBanner"
import { StyleTag } from "@/components/dashboard/StyleTag"
import { TemplateCard } from "@/components/dashboard/TemplateCard"
import { TemplateDetailModal, type TemplateDetail } from "@/components/dashboard/TemplateDetailModal"

const STYLE_TAG_KEYS = [
  "allStyles", "classy", "minimalism", "colorful", "modern",
  "vintage", "clean", "bold", "retro", "cute", "softColor",
] as const

const DUMMY_TEMPLATES: TemplateDetail[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: i === 0 ? "Javanese Elegant" : "Rose Blossom",
  categoryLabel: "Wedding Invitation",
  tags: i === 0 ? ["Classic", "Elegant", "Vintage"] : ["Modern", "Colorful", "Bold"],
  rating: 5,
  reviewCount: 24,
  price: 70000,
  originalPrice: 149000,
  imageUrl: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=438&q=80",
  description: i === 0
    ? `The Javanese Elegant template brings a refined and timeless wedding experience inspired by traditional Javanese aesthetics. With a harmonious blend of warm tones, elegant typography, and a clean layout, this template is perfect for couples who want to showcase a cultural yet modern and classy celebration.\n\nThis template includes:\n• Main Cover\n• Opening Section\n• Couple Profile\n• Event Details\n• Photo Gallery\n• Location Map\n• RSVP / Attendance Confirmation\n• Wishes & Messages\n• Countdown Timer`
    : `The Rose Blossom template offers a romantic and modern feel perfect for contemporary weddings. Featuring soft floral motifs and a clean design language, it's ideal for couples who want an elegant yet fresh celebration.\n\nThis template includes:\n• Main Cover\n• Opening Section\n• Couple Profile\n• Event Details\n• Photo Gallery\n• Location Map\n• RSVP / Attendance Confirmation\n• Wishes & Messages\n• Countdown Timer`,
}))

export default function DashboardPage() {
  const t = useTranslations("dashboard.tags")
  const [activeTagKey, setActiveTagKey] = React.useState<typeof STYLE_TAG_KEYS[number]>("allStyles")
  const [favourites, setFavourites] = React.useState<Set<number>>(new Set([1]))
  const [search, setSearch] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<number | null>(null)

  const selectedTemplate = selectedId === null
    ? null
    : (DUMMY_TEMPLATES.find((t) => t.id === selectedId) ?? null)

  const toggleFavourite = (id: string | number) => {
    setFavourites((prev) => {
      const next = new Set(prev)
      if (next.has(Number(id))) next.delete(Number(id))
      else next.add(Number(id))
      return next
    })
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
      <div className="mt-8 mx-auto grid w-full max-w-345 gap-x-6 gap-y-7" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(196px, 1fr))" }}>
        {DUMMY_TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            id={template.id}
            title={template.title}
            category={template.categoryLabel}
            price={template.price}
            originalPrice={template.originalPrice}
            imageUrl={template.imageUrl}
            isFavourite={favourites.has(Number(template.id))}
            onFavouriteToggle={toggleFavourite}
            onClick={(id) => setSelectedId(Number(id))}
          />
        ))}
      </div>

      <TemplateDetailModal
        template={selectedTemplate}
        isFavourite={selectedTemplate !== null && favourites.has(Number(selectedTemplate.id))}
        onFavouriteToggle={toggleFavourite}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}
