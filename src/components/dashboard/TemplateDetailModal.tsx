"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import Image from "next/image"
import { Heart, Star, Smartphone, Monitor, Eye, X, ArrowLeft } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useTranslations, useLocale } from "next-intl"

import { Button } from "@/components/ui/button"
import { RadioDot } from "@/components/ui/radio-dot"
import { cn } from "@/lib/utils"
import { useZoomScale } from "@/hooks/use-zoom-scale"
import MobileFrame from "@/assets/dashboard/mobile.svg"
import { useInvitationDurations } from "@/hooks/useInvitationDurations"

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

export function TemplateDetailModal({ template, isFavourite, onFavouriteToggle, onClose }: Props) {
  const { data: durations = [], isLoading: isDurationsLoading } = useInvitationDurations()
  const t = useTranslations("dashboard.modal")
  const locale = useLocale()
  const scale = useZoomScale()
  const [isDesktop, setIsDesktop] = React.useState(false)
  const [view, setView] = React.useState<"mobile" | "desktop">("mobile")
  const [step, setStep] = React.useState<"detail" | "addons">("detail")
  const [selectedDuration, setSelectedDuration] = React.useState("")

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)")
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  React.useEffect(() => {
    setView("mobile")
    setStep("detail")
    setSelectedDuration("")
  }, [template?.id])

  React.useEffect(() => {
    if (durations.length > 0 && !selectedDuration) {
      setSelectedDuration(durations[0].id)
    }
  }, [durations, selectedDuration])

  const handleContinueToPayment = () => {
    if (!template) return
    const selectedDurationObj = durations.find((d) => d.id === selectedDuration)
    const durationPrice = selectedDurationObj ? Number(selectedDurationObj.price) : 0
    const durationLabel = selectedDurationObj
      ? `${selectedDurationObj.duration} ${t(`durationUnit.${selectedDurationObj.unit}`)}`
      : ""
    const params = new URLSearchParams({
      templateId: String(template.id),
      title: template.title,
      price: String(template.price),
      image: template.imageUrl,
      category: template.categoryLabel,
      duration: selectedDuration,
      durationLabel,
      durationPrice: String(durationPrice),
    })
    if (template.originalPrice) params.set("originalPrice", String(template.originalPrice))
    window.open(`/${locale}/payment?${params.toString()}`, "_blank")
  }

  return (
    <DialogPrimitive.Root open={template !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[24px] bg-white shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          style={(isDesktop
            ? { zoom: scale, width: step === "detail" ? "1268px" : "1278px", height: step === "detail" ? "799px" : "860px", maxWidth: "calc(100vw - 2rem)", padding: step === "detail" ? "60px" : "0 60px 60px 60px" }
            : { width: "calc(100vw - 2rem)", maxWidth: "440px", height: "88vh", maxHeight: "88vh", padding: 0 }) as React.CSSProperties}
        >
          <DialogPrimitive.Title className="sr-only">{template?.title}</DialogPrimitive.Title>


          {template && step === "detail" && (
            <div className="hidden h-full grid-cols-[325px_1fr_auto] gap-x-[31px] overflow-hidden xl:grid">
              {/* ── Left: Preview ── */}
              <div className="flex h-full flex-col items-center justify-start">
                {/* Phone / Desktop preview */}
                {view === "mobile" ? (
                  <div className="relative shrink-0" style={{ width: "270px", height: "526px" }}>
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
                    className="relative shrink-0 w-[270px] overflow-hidden rounded-lg ring-8 ring-zinc-800"
                    style={{ height: "526px" }}
                  >
                    <Image
                      src={template.imageUrl}
                      alt={template.title}
                      fill
                      className="object-cover"
                      sizes="270px"
                    />
                    <div className="pointer-events-none absolute -bottom-4 left-1/2 h-4 w-20 -translate-x-1/2 rounded-b bg-zinc-800" />
                  </div>
                )}

                {/* Mobile / Desktop toggle - 30px below preview, no gap between buttons */}
                <div className="flex shrink-0" style={{ marginTop: "30px" }}>
                  <button
                    type="button"
                    onClick={() => setView("mobile")}
                    className="cursor-pointer transition-colors"
                    style={{
                      width: "130px",
                      borderRadius: "10px",
                      backgroundColor: view === "mobile" ? "#E0E7FF" : "var(--accent)",
                      padding: "12px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px",
                    }}
                  >
                    <Smartphone style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                    <span style={{ fontSize: "14px", fontWeight: 500, lineHeight: "20px", color: "#000000" }}>
                      {t("mobile")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("desktop")}
                    className="cursor-pointer transition-colors"
                    style={{
                      width: "130px",
                      borderRadius: "10px",
                      backgroundColor: view === "desktop" ? "#E0E7FF" : "var(--accent)",
                      padding: "12px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px",
                    }}
                  >
                    <Monitor style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                    <span style={{ fontSize: "14px", fontWeight: 500, lineHeight: "20px", color: "#000000" }}>
                      {t("desktop")}
                    </span>
                  </button>
                </div>

                {/* Demo button - 19px below toggle */}
                <button
                  type="button"
                  className="cursor-pointer shrink-0 transition-colors hover:bg-zinc-50"
                  style={{
                    marginTop: "19px",
                    width: "265px",
                    height: "50px",
                    borderRadius: "12px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e5e5",
                    padding: "16px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <Eye style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                  <span style={{ fontSize: "14px", fontWeight: 500, lineHeight: "20px", color: "var(--foreground)" }}>
                    {t("demo")}
                  </span>
                </button>
              </div>

              {/* ── Right: Details ── */}
              <div className="flex h-full flex-col overflow-hidden">

                {/* Category badge */}
                <span
                  className="inline-flex shrink-0 items-center justify-center border shadow-xs"
                  style={{
                    width: "175px",
                    height: "40px",
                    borderRadius: "8px",
                    backgroundColor: "#818cf8",
                    fontSize: "16px",
                    fontWeight: 500,
                    lineHeight: "24px",
                    color: "var(--background)",
                    marginBottom: "16px",
                    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                  }}
                >
                  {template.categoryLabel}
                </span>

                {/* Title + heart */}
                <div className="flex shrink-0 items-center" style={{ marginBottom: "16px" }}>
                  <h2
                    className="flex-1"
                    style={{ fontSize: "36px", fontWeight: 600, lineHeight: "40px", color: "var(--foreground)" }}
                  >
                    {template.title}
                  </h2>
                  <motion.button
                    type="button"
                    aria-label="Toggle favourite"
                    className="cursor-pointer shrink-0 flex items-center justify-center rounded-full transition-all"
                    style={{
                      width: "54px",
                      height: "54px",
                      backgroundColor: isFavourite ? "var(--accent)" : "transparent",
                    }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => onFavouriteToggle(template.id)}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={isFavourite ? "fav" : "unfav"}
                        initial={{ scale: 0.5, opacity: 0.6 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <Heart
                          style={{ width: "24px", height: "24px" }}
                          className={cn(
                            "transition-colors",
                            isFavourite ? "fill-red-500 text-red-500" : "text-zinc-300 hover:text-red-400"
                          )}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </motion.button>
                </div>

                {/* Style chips */}
                <div className="flex shrink-0 flex-wrap" style={{ gap: "14px", marginBottom: "16px" }}>
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center justify-center"
                      style={{
                        height: "35px",
                        borderRadius: "15px",
                        border: "1px solid #a5b4fc",
                        backgroundColor: "#eef2ff",
                        padding: "6px 24px",
                        fontSize: "14px",
                        fontWeight: 500,
                        lineHeight: "20px",
                        color: "var(--foreground)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Rating */}
                <div className="flex shrink-0 items-center" style={{ marginBottom: "16px" }}>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        style={{ width: "20px", height: "20px" }}
                        className={cn(
                          i < template.rating
                            ? "fill-amber-500 text-amber-500"
                            : "fill-zinc-200 text-zinc-200"
                        )}
                      />
                    ))}
                  </div>
                  <span
                    style={{
                      marginLeft: "10px",
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "24px",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    ({template.reviewCount})
                  </span>
                </div>

                {/* Price */}
                <div className="flex shrink-0 items-center" style={{ marginBottom: "26px" }}>
                  <span
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      lineHeight: "32px",
                      color: "var(--primary)",
                      marginRight: "16px",
                    }}
                  >
                    Rp {template.price.toLocaleString("id-ID")}
                  </span>
                  {!!template.originalPrice && (
                    <span
                      className="relative"
                      style={{
                        fontSize: "18px",
                        fontWeight: 400,
                        lineHeight: "28px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      Rp {template.originalPrice.toLocaleString("id-ID")}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(-9.37deg, transparent calc(50% - 1px), var(--destructive) 50%, transparent calc(50% + 1px))",
                        }}
                      />
                    </span>
                  )}
                </div>

                {/* Description */}
                <div
                  className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-zinc-200 text-sm leading-relaxed text-foreground"
                  style={{
                    padding: "24px",
                    scrollbarGutter: "stable",
                  }}
                >
                  <p className="whitespace-pre-wrap pr-2">{template.description}</p>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  className="cursor-pointer shrink-0 rounded-xl transition-colors hover:opacity-90"
                  style={{
                    marginTop: "16px",
                    width: "100%",
                    height: "60px",
                    backgroundColor: "var(--primary)",
                    fontSize: "16px",
                    fontWeight: 600,
                    lineHeight: "20px",
                    color: "var(--primary-foreground)",
                  }}
                  onClick={() => setStep("addons")}
                >
                  {t("seeAddOns")}
                </button>
              </div>

              {/* ── Col 3: X close button ── */}
              <div className="flex flex-col items-center">
                <DialogPrimitive.Close asChild>
                  <button
                    className="cursor-pointer rounded-full transition-colors hover:bg-zinc-100"
                    aria-label="Close"
                    style={{ padding: "16px", color: "var(--foreground)" }}
                  >
                    <X style={{ width: "16px", height: "16px" }} />
                  </button>
                </DialogPrimitive.Close>
              </div>
            </div>
          )}

          {/* ── Mobile: detail (stacked) ── */}
          {template && step === "detail" && (
            <div className="flex h-full flex-col xl:hidden">
              {/* Header: favourite · title · close */}
              <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-5">
                <motion.button
                  type="button"
                  aria-label="Toggle favourite"
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors"
                  style={{ backgroundColor: "var(--accent)" }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => onFavouriteToggle(template.id)}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={isFavourite ? "fav" : "unfav"}
                      initial={{ scale: 0.5, opacity: 0.6 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <Heart
                        style={{ width: "20px", height: "20px" }}
                        className={cn(isFavourite ? "fill-red-500 text-red-500" : "text-zinc-400")}
                      />
                    </motion.div>
                  </AnimatePresence>
                </motion.button>
                <h2 className="flex-1 truncate px-3 text-center text-xl font-bold text-foreground">
                  {template.title}
                </h2>
                <DialogPrimitive.Close asChild>
                  <button
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors hover:bg-zinc-100"
                    aria-label="Close"
                  >
                    <X style={{ width: "18px", height: "18px" }} />
                  </button>
                </DialogPrimitive.Close>
              </div>

              {/* Body */}
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-5">
                {/* Category badge */}
                <span
                  className="mx-auto inline-flex shrink-0 items-center justify-center border shadow-xs"
                  style={{
                    height: "36px",
                    minWidth: "150px",
                    borderRadius: "8px",
                    backgroundColor: "#818cf8",
                    padding: "0 20px",
                    fontSize: "14px",
                    fontWeight: 500,
                    lineHeight: "20px",
                    color: "var(--background)",
                    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                  }}
                >
                  {template.categoryLabel}
                </span>

                {/* Preview */}
                <div className="mt-4 flex shrink-0 justify-center">
                  {view === "mobile" ? (
                    <div className="relative shrink-0" style={{ width: "150px", height: "292px" }}>
                      <div
                        className="absolute overflow-hidden"
                        style={{ left: "2.593%", right: "2.593%", top: "1.331%", bottom: "1.331%", borderRadius: "28px" }}
                      >
                        <Image src={template.imageUrl} alt={template.title} fill className="object-cover" sizes="150px" />
                      </div>
                      <Image src={MobileFrame} alt="" fill className="pointer-events-none object-contain" />
                    </div>
                  ) : (
                    <div
                      className="relative w-[150px] shrink-0 overflow-hidden rounded-lg ring-4 ring-zinc-800"
                      style={{ height: "292px" }}
                    >
                      <Image src={template.imageUrl} alt={template.title} fill className="object-cover" sizes="150px" />
                    </div>
                  )}
                </div>

                {/* Toggle (icon-only) + Demo */}
                <div className="mt-4 flex shrink-0 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setView("mobile")}
                      aria-label={t("mobile")}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center transition-colors"
                      style={{ borderRadius: "10px", backgroundColor: view === "mobile" ? "#E0E7FF" : "var(--accent)" }}
                    >
                      <Smartphone style={{ width: "18px", height: "18px" }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setView("desktop")}
                      aria-label={t("desktop")}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center transition-colors"
                      style={{ borderRadius: "10px", backgroundColor: view === "desktop" ? "#E0E7FF" : "var(--accent)" }}
                    >
                      <Monitor style={{ width: "18px", height: "18px" }} />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="flex h-10 cursor-pointer items-center justify-center gap-2 transition-colors hover:bg-zinc-50"
                    style={{ borderRadius: "10px", backgroundColor: "#ffffff", border: "1px solid #e5e5e5", padding: "0 18px" }}
                  >
                    <Eye style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                    <span style={{ fontSize: "14px", fontWeight: 500, lineHeight: "20px", color: "var(--foreground)" }}>
                      {t("demo")}
                    </span>
                  </button>
                </div>

                {/* Rating + Price */}
                <div className="mt-4 flex shrink-0 items-start justify-between">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        style={{ width: "16px", height: "16px" }}
                        className={cn(i < template.rating ? "fill-amber-500 text-amber-500" : "fill-zinc-200 text-zinc-200")}
                      />
                    ))}
                    <span style={{ marginLeft: "8px", fontSize: "14px", color: "var(--muted-foreground)" }}>
                      ({template.reviewCount})
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span style={{ fontSize: "18px", fontWeight: 700, lineHeight: "24px", color: "var(--primary)" }}>
                      Rp {template.price.toLocaleString("id-ID")}
                    </span>
                    {!!template.originalPrice && (
                      <span
                        className="relative"
                        style={{ fontSize: "14px", fontWeight: 400, lineHeight: "20px", color: "var(--muted-foreground)" }}
                      >
                        Rp {template.originalPrice.toLocaleString("id-ID")}
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0"
                          style={{ background: "linear-gradient(-9.37deg, transparent calc(50% - 1px), var(--destructive) 50%, transparent calc(50% + 1px))" }}
                        />
                      </span>
                    )}
                  </div>
                </div>

                {/* Style chips */}
                <div className="mt-4 flex shrink-0 flex-wrap" style={{ gap: "10px" }}>
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center justify-center"
                      style={{
                        height: "32px",
                        borderRadius: "15px",
                        border: "1px solid #a5b4fc",
                        backgroundColor: "#eef2ff",
                        padding: "6px 18px",
                        fontSize: "13px",
                        fontWeight: 500,
                        lineHeight: "20px",
                        color: "var(--foreground)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <div
                  className="mt-4 min-h-0 flex-1 overflow-y-auto rounded-xl border border-zinc-200 text-sm leading-relaxed text-foreground"
                  style={{ padding: "16px", scrollbarGutter: "stable" }}
                >
                  <p className="whitespace-pre-wrap pr-1">{template.description}</p>
                </div>
              </div>

              {/* CTA */}
              <div className="shrink-0 px-5 pb-5 pt-2">
                <button
                  type="button"
                  className="w-full cursor-pointer rounded-xl transition-colors hover:opacity-90"
                  style={{ height: "52px", backgroundColor: "var(--primary)", fontSize: "15px", fontWeight: 600, lineHeight: "20px", color: "var(--primary-foreground)" }}
                  onClick={() => setStep("addons")}
                >
                  {t("seeAddOns")}
                </button>
              </div>
            </div>
          )}

          {template && step === "addons" && (
            <div className="flex h-full flex-col overflow-hidden px-5 pb-5 xl:px-0 xl:pb-0">
              {/* Header */}
              <div className="relative flex shrink-0 items-center justify-center border-b border-zinc-100 pb-4 pt-6 xl:pb-6 xl:pt-[60px]">
                <button
                  type="button"
                  className="absolute left-0 flex items-center justify-center rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                  onClick={() => setStep("detail")}
                  aria-label="Back"
                >
                  <ArrowLeft className="h-5 w-5 xl:h-6 xl:w-6" />
                </button>
                <h2 className="text-xl font-semibold leading-tight text-foreground xl:text-[48px] xl:leading-[48px]">
                  {t("addOns")}
                </h2>
                <DialogPrimitive.Close asChild>
                  <button
                    className="absolute right-0 cursor-pointer rounded-full transition-colors hover:bg-zinc-100"
                    aria-label="Close"
                    style={{ padding: "8px", color: "var(--foreground)" }}
                  >
                    <X style={{ width: "16px", height: "16px" }} />
                  </button>
                </DialogPrimitive.Close>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 space-y-5 overflow-y-auto py-4 xl:py-6">
                {/* Duration add ons */}
                <div>
                  <p className="text-lg text-zinc-900 xl:text-2xl">{t("durationAddOns")}</p>
                  <p className="mb-3 mt-1 text-sm text-zinc-400 xl:mb-4">{t("durationAddOnsSubtitle")}</p>
                  <div className="space-y-2">
                    {isDurationsLoading ? (
                      <div className="flex items-center justify-center py-6 text-sm text-zinc-400">Loading...</div>
                    ) : durations.map((duration) => {
                      const price = Number(duration.price)
                      const label = `${duration.duration} ${t(`durationUnit.${duration.unit}`)}`
                      return (
                        <div
                          key={duration.id}
                          className="flex min-h-20 cursor-pointer items-center gap-3 rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-3 transition-colors hover:bg-indigo-100 xl:gap-4 xl:py-0"
                          onClick={() => setSelectedDuration(duration.id)}
                        >
                          <span className="flex-1 text-sm font-medium text-foreground xl:text-lg">{label}</span>
                          <span className="whitespace-nowrap text-sm font-medium text-foreground xl:text-lg">
                            {price === 0 ? "Rp 0" : `Rp ${price.toLocaleString("id-ID")}`}
                          </span>
                          <RadioDot checked={selectedDuration === duration.id} className="ml-3" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="shrink-0 border-t border-zinc-100 pt-4 xl:pt-6">
                <Button size="lg" className="h-12 w-full rounded-xl text-sm font-semibold xl:h-15 xl:text-base" onClick={handleContinueToPayment}>
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
