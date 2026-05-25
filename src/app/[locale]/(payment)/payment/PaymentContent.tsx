"use client"

import * as React from "react"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import QrisIcon from "@/assets/logo/Qris-icon.svg"
import { Button } from "@/components/ui/button"

const FEATURE_ADDONS = [
  { key: "instagramFilter", price: 10000 },
  { key: "multiLanguage", price: 10000 },
  { key: "galleryMomenia", price: 10000 },
  { key: "customDomainLink", price: 10000 },
] as const

type ModalKey =
  | "instagramFilter"
  | "multiLanguage"
  | "galleryMomenia"
  | "customDomainLink"
  | "basic2week"
  | "month3"
  | "month6"
  | "month8"

export function PaymentContent() {
  const searchParams = useSearchParams()
  const t = useTranslations("dashboard.payment")
  const tModal = useTranslations("dashboard.modal")

  const title = searchParams.get("title") ?? ""
  const price = Number(searchParams.get("price") ?? 0)
  const image = searchParams.get("image") ?? ""
  const category = searchParams.get("category") ?? ""
  const durationKey = (searchParams.get("duration") ?? "basic2week") as ModalKey
  const durationPrice = Number(searchParams.get("durationPrice") ?? 0)
  const featuresParam = searchParams.get("features") ?? ""
  const selectedFeatures = featuresParam ? featuresParam.split(",").filter(Boolean) : []

  const featurePrices = selectedFeatures.map((key) => {
    const addon = FEATURE_ADDONS.find((a) => a.key === key)
    return addon?.price ?? 10000
  })

  const featuresTotal = featurePrices.reduce((sum, p) => sum + p, 0)
  const subtotal = price + durationPrice + featuresTotal
  const total = subtotal

  const fmt = (n: number) => `Rp ${n.toLocaleString("id-ID")}`

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "var(--font-geist-sans)" }}
    >
      <div className="mx-auto w-full px-16 py-10 md:py-12">

        {/* ── Title row ── */}
        <div className="relative mb-10 flex items-center justify-center">
          <button
            type="button"
            onClick={() => window.close()}
            className="absolute left-0 flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </button>
          {/* Payment — Semi Bold 48px */}
          <h1 className="text-[48px] font-semibold leading-tight text-zinc-900">
            {t("title")}
          </h1>
          <div className="absolute right-0 w-16" />
        </div>

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">

          {/* ══ LEFT: Item Details ══ */}
          <div>
            {/* Item Details — Medium 24px */}
            <h2 className="mb-5 text-2xl font-medium text-zinc-900">{t("itemDetails")}</h2>

            {/* Template card — height 116px */}
            <div
              className="mb-3 flex w-full items-center gap-4 rounded-xl border border-indigo-200 bg-indigo-50 px-5"
              style={{ height: "116px" }}
            >
              <div className="relative h-19 w-19 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                {image && (
                  <Image src={image} alt={title} fill className="object-cover" sizes="76px" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {/* Title — Medium 18px */}
                <p className="truncate text-lg font-medium text-zinc-900">{title}</p>
                {/* Category — Medium 18px */}
                {category && (
                  <p className="truncate text-lg font-medium text-zinc-500">{category}</p>
                )}
                {/* Duration info — Normal 14px */}
                <p className="truncate text-sm font-normal text-zinc-400">{tModal(durationKey)}</p>
              </div>
              {/* Price — Medium 18px */}
              <p className="shrink-0 text-lg font-medium text-zinc-900">{fmt(price)}</p>
            </div>

            {/* Duration add-on row — height 88px, only when price > 0 */}
            {durationPrice > 0 && (
              <div
                className="mb-3 flex w-full items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-5"
                style={{ height: "88px" }}
              >
                <span className="text-lg font-medium text-zinc-800">{tModal(durationKey)}</span>
                <span className="text-lg font-medium text-zinc-800">{fmt(durationPrice)}</span>
              </div>
            )}

            {/* Feature add-on rows — height 88px each */}
            {selectedFeatures.map((key, i) => (
              <div
                key={key}
                className="mb-3 flex w-full items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-5"
                style={{ height: "88px" }}
              >
                <span className="text-lg font-medium text-zinc-800">{tModal(key as ModalKey)}</span>
                <span className="text-lg font-medium text-zinc-800">{fmt(featurePrices[i])}</span>
              </div>
            ))}

            {/* More add-ons placeholder — height 88px */}
            <div
              className="flex w-full cursor-default items-center rounded-xl border border-dashed border-zinc-300 px-5"
              style={{ height: "88px" }}
            >
              <span className="text-lg font-medium text-zinc-400">+ {t("addons")}</span>
            </div>
          </div>

          {/* ══ RIGHT: Order Summary + Checkout ══ */}
          <div className="flex flex-col gap-6">

            {/* Order Summary */}
            <div>
              {/* Order Summary — Medium 24px */}
              <h2 className="mb-5 text-2xl font-medium text-zinc-900">{t("orderSummary")}</h2>

              <div className="space-y-2.5 text-base">
                <div className="flex items-center justify-end gap-3">
                  <span className="text-zinc-500">{t("subtotal")}</span>
                  <span className="text-zinc-400">:</span>
                  <span className="w-32 text-right font-medium text-zinc-900">{fmt(subtotal)}</span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-zinc-500">{t("discount")}</span>
                  <span className="text-zinc-400">:</span>
                  <span className="w-32 text-right font-medium text-zinc-900">Rp 0</span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="font-semibold text-zinc-900">{t("total")}</span>
                  <span className="text-zinc-400">:</span>
                  <span className="w-32 text-right text-lg font-bold text-zinc-900">{fmt(total)}</span>
                </div>
              </div>
            </div>

            {/* Checkout */}
            <div>
              {/* Checkout — Medium 24px */}
              <h2 className="mb-5 text-2xl font-medium text-zinc-900">Checkout</h2>

              {/* QRIS card — height 80px */}
              <div
                className="mb-4 flex w-full items-center gap-4 rounded-xl border border-indigo-200 bg-indigo-50 px-5"
                style={{ height: "80px" }}
              >
                <Image src={QrisIcon} alt="QRIS" width={80} height={30} className="object-contain" />
                <span className="text-lg font-medium text-zinc-700">QRIS</span>
              </div>

              {/* Pay Order — height 80px */}
              <Button
                className="w-full rounded-xl text-lg font-semibold shadow-md shadow-indigo-200/50 transition-transform hover:-translate-y-0.5 active:scale-95"
                style={{ height: "80px" }}
              >
                {t("payOrder")}
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
