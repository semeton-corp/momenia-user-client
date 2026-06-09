"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import Image from "next/image"
import { Heart, Star, Smartphone, Monitor, Eye, X, ArrowLeft, ChevronDown, ChevronRight, Info } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"

import { Button } from "@/components/ui/button"
import { CheckboxTile } from "@/components/ui/checkbox-tile"
import { RadioDot } from "@/components/ui/radio-dot"
import { cn } from "@/lib/utils"
import { useZoomScale } from "@/hooks/use-zoom-scale"
import MobileFrame from "@/assets/dashboard/mobile.svg"

export type TemplateDetail = {
  id: string | number
  title: string
  categoryLabel: string
  tags: string[]
  rating: number
  reviewCount: number
  price: number
  originalPrice?: number
  imageUrl: string
  description: string
}

type Props = {
  template: TemplateDetail | null
  isFavourite: boolean
  onFavouriteToggle: (id: string | number) => void
  onClose: () => void
}

const FEATURE_ADDONS = [
  { key: "instagramFilter", price: 10000 },
  { key: "multiLanguage", price: 10000 },
  { key: "galleryMomenia", price: 10000, expandable: true },
  { key: "customDomainLink", price: 10000 },
] as const

const DURATION_ADDONS = [
  { key: "basic2week", price: 0 },
  { key: "month3", price: 10000 },
  { key: "month6", price: 10000 },
  { key: "month8", price: 10000 },
] as const

export function TemplateDetailModal({ template, isFavourite, onFavouriteToggle, onClose }: Props) {
  const t = useTranslations("dashboard.modal")
  const locale = useLocale()
  const scale = useZoomScale()
  const [view, setView] = React.useState<"mobile" | "desktop">("mobile")
  const [step, setStep] = React.useState<"detail" | "addons">("detail")
  const [selectedFeatures, setSelectedFeatures] = React.useState<Set<string>>(new Set())
  const [selectedDuration, setSelectedDuration] = React.useState("basic2week")
  const [expandedAddon, setExpandedAddon] = React.useState<string | null>(null)

  React.useEffect(() => {
    setView("mobile")
    setStep("detail")
    setSelectedFeatures(new Set())
    setSelectedDuration("basic2week")
    setExpandedAddon(null)
  }, [template?.id])

  const toggleFeature = (key: string) => {
    setSelectedFeatures((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleContinueToPayment = () => {
    if (!template) return
    const durationPrice = DURATION_ADDONS.find((d) => d.key === selectedDuration)?.price ?? 0
    const params = new URLSearchParams({
      title: template.title,
      price: String(template.price),
      image: template.imageUrl,
      category: template.categoryLabel,
      duration: selectedDuration,
      durationPrice: String(durationPrice),
    })
    const featureKeys = Array.from(selectedFeatures).join(",")
    if (featureKeys) params.set("features", featureKeys)
    if (template.originalPrice) params.set("originalPrice", String(template.originalPrice))
    window.open(`/${locale}/payment?${params.toString()}`, "_blank")
  }

  return (
    <DialogPrimitive.Root open={template !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-280 -translate-x-1/2 -translate-y-1/2 rounded-4xl bg-white p-5 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          style={{ zoom: scale } as React.CSSProperties}
        >
          <DialogPrimitive.Title className="sr-only">{template?.title}</DialogPrimitive.Title>

          {/* Close */}
          <DialogPrimitive.Close asChild>
            <button
              className="absolute right-5 top-5 z-10 rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </DialogPrimitive.Close>

          {template && step === "detail" && (
            <div className="grid grid-cols-[2fr_3fr] overflow-hidden rounded-4xl">
              {/* ── Left: Preview ── */}
              <div className="flex h-full flex-col items-center gap-5 bg-white p-8">
                {/* Phone / Desktop preview */}
                <div className="flex flex-1 w-full items-center justify-center">
                  {view === "mobile" ? (
                    <div
                      className="relative mx-auto"
                      style={{ width: "285px", aspectRatio: "270 / 526" }}
                    >
                      <div
                        className="absolute overflow-hidden"
                        style={{
                          left: "2.593%",
                          right: "2.593%",
                          top: "1.331%",
                          bottom: "1.331%",
                          borderRadius: "50px",
                        }}
                      >
                        <Image
                          src={template.imageUrl}
                          alt={template.title}
                          fill
                          className="object-cover"
                          sizes="270px"
                        />
                      </div>
                      <Image
                        src={MobileFrame}
                        alt=""
                        fill
                        className="pointer-events-none object-contain"
                      />
                    </div>
                  ) : (
                    <div
                      className="relative w-full overflow-hidden rounded-lg ring-10 ring-zinc-800"
                      style={{ aspectRatio: "4 / 3" }}
                    >
                      <Image
                        src={template.imageUrl}
                        alt={template.title}
                        fill
                        className="object-cover"
                        sizes="320px"
                      />
                      <div className="pointer-events-none absolute -bottom-5 left-1/2 h-5 w-24 -translate-x-1/2 rounded-b bg-zinc-800" />
                    </div>
                  )}
                </div>

                {/* Mobile / Desktop toggle */}
                <div className="flex w-full gap-2">
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex-1 h-12.5 rounded-xl text-base",
                      view === "mobile"
                        ? "bg-indigo-100 text-foreground hover:bg-indigo-200 hover:text-foreground"
                        : "bg-zinc-100 text-foreground hover:bg-zinc-200 hover:text-foreground"
                    )}
                    onClick={() => setView("mobile")}
                  >
                    <Smartphone className="h-4 w-4" />
                    {t("mobile")}
                  </Button>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex-1 h-12.5 rounded-xl text-base",
                      view === "desktop"
                        ? "bg-indigo-100 text-foreground hover:bg-indigo-200 hover:text-foreground"
                        : "bg-zinc-100 text-foreground hover:bg-zinc-200 hover:text-foreground"
                    )}
                    onClick={() => setView("desktop")}
                  >
                    <Monitor className="h-4 w-4" />
                    {t("desktop")}
                  </Button>
                </div>

                {/* Demo */}
                <Button
                  variant="outline"
                  className="w-full h-12.5 rounded-xl border-zinc-200 text-base text-foreground hover:bg-zinc-50"
                >
                  <Eye className="h-4 w-4" />
                  {t("demo")}
                </Button>
              </div>

              {/* ── Right: Details ── */}
              <div className="flex h-full flex-col gap-5 p-8">
                {/* Category badge */}
                <div>
                  <span className="inline-flex h-10 w-43.75 items-center justify-center rounded-lg border border-border bg-indigo-400 text-sm font-medium text-white shadow-md">
                    {template.categoryLabel}
                  </span>
                </div>

                {/* Title + heart */}
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-3xl font-bold leading-tight text-zinc-900">{template.title}</h2>
                  <button
                    type="button"
                    aria-label="Toggle favourite"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent transition-colors hover:bg-accent/80"
                    onClick={() => onFavouriteToggle(template.id)}
                  >
                    <Heart
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isFavourite ? "fill-red-500 text-red-500" : "text-zinc-300 hover:text-red-400"
                      )}
                    />
                  </button>
                </div>

                {/* Style chips */}
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-[15px] border border-indigo-300 bg-indigo-50 px-6 py-1.5 text-sm font-medium text-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < template.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-zinc-200 text-zinc-200"
                      )}
                    />
                  ))}
                  <span className="text-sm text-zinc-500">({template.reviewCount})</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl font-bold text-primary">
                    Rp {template.price.toLocaleString("id-ID")}
                  </span>
                  {!!template.originalPrice && (
                    <span className="relative font-normal text-base text-zinc-400">
                      Rp {template.originalPrice.toLocaleString("id-ID")}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to top left, transparent calc(50% - 1.5px), #df2225 50%, transparent calc(50% + 1.5px))",
                        }}
                      />
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-zinc-200 p-4 text-sm leading-relaxed text-foreground">
                  <p className="whitespace-pre-wrap">{template.description}</p>
                </div>

                {/* CTA */}
                <Button
                  size="lg"
                  className="h-15 w-full shrink-0 rounded-xl text-base font-semibold"
                  onClick={() => setStep("addons")}
                >
                  {t("seeAddOns")}
                </Button>
              </div>
            </div>
          )}

          {template && step === "addons" && (
            <div className="flex flex-col overflow-hidden rounded-4xl" style={{ maxHeight: "calc(100vh - 5rem)" }}>
              {/* Header */}
              <div className="relative flex shrink-0 items-center justify-center border-b border-zinc-100 px-6 py-6">
                <button
                  type="button"
                  className="absolute left-6 flex items-center justify-center rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                  onClick={() => setStep("detail")}
                  aria-label="Back"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <h2 className="text-4xl font-bold text-zinc-900">{t("addOns")}</h2>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Feature add ons */}
                <div>
                  <p className="mb-3 text-2xl text-zinc-900">{t("featureAddOns")}</p>
                  <div className="space-y-2">
                    {FEATURE_ADDONS.map((addon) => {
                      const expandable = "expandable" in addon
                      const isExpanded = expandable && expandedAddon === addon.key
                      return (
                        <div key={addon.key} className="rounded-xl border border-indigo-300 bg-indigo-50">
                          <div className="flex h-20 items-center px-4 rounded-xl">
                            <div className="flex flex-1 items-center gap-1.5">
                              <span className="text-lg font-medium text-foreground">{t(addon.key)}</span>
                              <Info className="h-5 w-5 shrink-0 text-indigo-400" />
                              {expandable && (
                                <button
                                  type="button"
                                  className="rounded p-0.5 transition-colors hover:bg-indigo-200"
                                  onClick={() => setExpandedAddon((prev) => (prev === addon.key ? null : addon.key))}
                                >
                                  {isExpanded
                                    ? <ChevronDown className="h-5 w-5 shrink-0 text-zinc-400" />
                                    : <ChevronRight className="h-5 w-5 shrink-0 text-zinc-400" />}
                                </button>
                              )}
                            </div>
                            <span className="mr-3 text-lg font-medium text-foreground">
                              Rp {addon.price.toLocaleString("id-ID")}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleFeature(addon.key)}
                              className="flex items-center"
                            >
                              <CheckboxTile checked={selectedFeatures.has(addon.key)} />
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="flex gap-4 px-4 pb-4">
                              <div className="flex h-24 w-36 shrink-0 items-center justify-center rounded-lg bg-zinc-200">
                                <svg className="h-8 w-8 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <rect x="3" y="3" width="18" height="18" rx="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <path d="M21 15l-5-5L5 21" />
                                </svg>
                              </div>
                              <p className="text-sm font-normal leading-relaxed text-zinc-500">{t("galleryMomeniaDesc")}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Duration add ons */}
                <div>
                  <p className="mb-3 text-2xl text-zinc-900">{t("durationAddOns")}</p>
                  <div className="space-y-2">
                    {DURATION_ADDONS.map(({ key, price }) => (
                      <div
                        key={key}
                        className="flex cursor-pointer items-center gap-4 rounded-xl border border-indigo-300 bg-indigo-50 px-4 h-20 transition-colors hover:bg-indigo-100"
                        onClick={() => setSelectedDuration(key)}
                      >
                        <span className="flex-1 text-lg font-medium text-foreground">{t(key)}</span>
                        <span className="text-lg font-medium text-foreground">
                          {price === 0 ? "Rp 0" : `Rp ${price.toLocaleString("id-ID")}`}
                        </span>
                        <RadioDot checked={selectedDuration === key} className="ml-3"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="shrink-0 border-t border-zinc-100 p-6">
                <Button size="lg" className="h-15 w-full rounded-xl text-base font-semibold" onClick={handleContinueToPayment}>
                  {t("continueToPayment")}
                </Button>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
