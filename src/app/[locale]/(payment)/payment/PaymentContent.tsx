"use client"

import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import QrisIcon from "@/assets/logo/Qris-icon.svg"
import { Button } from "@/components/ui/button"
import { useRouter } from "@/i18n/navigation"
import { useCreateTransaction } from "@/hooks/useCreateTransaction"
import { PaymentModal } from "./PaymentModal"
import type { CreateTransactionResponse } from "@/lib/api/transaction/transaction.types"

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations("dashboard.payment")
  const tModal = useTranslations("dashboard.modal")
  const { mutate: createTransaction, isPending, data: transactionData } = useCreateTransaction()

  const [pendingTransaction, setPendingTransaction] = useState<CreateTransactionResponse | null>(null)
  const [showModal, setShowModal] = useState(false)

  const templateId = searchParams.get("templateId") ?? ""
  const title = searchParams.get("title") ?? ""
  const price = Number(searchParams.get("price") ?? 0)
  const image = searchParams.get("image") ?? ""
  const category = searchParams.get("category") ?? ""
  const durationKey = searchParams.get("duration") ?? ""
  const durationLabel = searchParams.get("durationLabel") ?? ""
  const durationPrice = Number(searchParams.get("durationPrice") ?? 0)
  const featuresParam = searchParams.get("features") ?? ""
  const selectedFeatures = featuresParam ? featuresParam.split(",").filter(Boolean) : []

  // Restore transaction from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("pendingTransaction")
    if (stored) {
      try {
        const transaction = JSON.parse(stored)
        setPendingTransaction(transaction)
        setShowModal(true)
      } catch {
        localStorage.removeItem("pendingTransaction")
      }
    }
  }, [])

  // Show modal when new transaction is created
  useEffect(() => {
    if (transactionData) {
      setPendingTransaction(transactionData)
      setShowModal(true)
    }
  }, [transactionData])

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
            onClick={() => {
              if (window.history.length > 1) {
                router.back()
                return
              }

              router.push("/dashboard")
            }}
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
                <p className="truncate text-sm font-normal text-zinc-400">{durationLabel}</p>
              </div>
              {/* Price — Medium 18px */}
              <p className="shrink-0 text-lg font-medium text-zinc-900">{fmt(price)}</p>
            </div>

            {/* Duration add-on row — show always, even if price is 0 */}
            {durationLabel && (
              <div
                className="mb-3 flex w-full items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-5"
                style={{ height: "88px" }}
              >
                <span className="text-lg font-medium text-zinc-800">{durationLabel}</span>
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

            {/* More add-ons button */}
            <button
              type="button"
              className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-400 bg-white px-5 py-6 transition-all hover:border-indigo-500 hover:bg-indigo-50 active:scale-95"
            >
              <div className="mb-1.5 flex items-center justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              <span className="text-base font-semibold text-indigo-600">{t("addons")}</span>
              <span className="mt-0.5 text-xs text-zinc-500">Add Additional Features or Services</span>
            </button>
          </div>

          {/* ══ RIGHT: Order Summary + Checkout ══ */}
          <div className="flex flex-col gap-8 rounded-3xl border border-zinc-200 bg-white p-8 lg:sticky lg:top-20 lg:h-fit">

            {/* Order Summary */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-zinc-900">{t("orderSummary")}</h2>
              </div>

              <div className="space-y-4 border-b border-zinc-200 pb-6">
                <div className="flex items-center justify-between">
                  <span className="text-base text-zinc-600">{t("subtotal")}</span>
                  <span className="text-base font-medium text-zinc-900">{fmt(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base text-zinc-600">{t("discount")}</span>
                  <span className="text-base font-medium text-zinc-900">Rp 0</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-semibold text-zinc-900">{t("total")}</span>
                  <span className="text-2xl font-bold text-indigo-600">{fmt(total)}</span>
                </div>
              </div>
            </div>

            {/* Checkout */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h10m4 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900">{t("checkout")}</h3>
                  <p className="text-sm text-zinc-500">{t("selectPaymentMethod")}</p>
                </div>
              </div>

              {/* QRIS card — selected state */}
              <div
                className="mb-6 flex w-full items-center gap-4 rounded-2xl border-2 border-indigo-500 bg-indigo-50 px-6 py-4 cursor-pointer transition-all"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-indigo-500 bg-indigo-500">
                  <div className="h-2.5 w-2.5 rounded-full bg-white" />
                </div>
                <Image src={QrisIcon} alt="QRIS" width={80} height={30} className="object-contain" />
                <span className="text-lg font-semibold text-zinc-900">QRIS</span>
              </div>

              {/* Info box */}
              <div className="mb-6 flex gap-3 rounded-2xl bg-zinc-100 p-4">
                <svg className="h-5 w-5 shrink-0 text-indigo-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-zinc-600">{t("paymentInfo")}</p>
              </div>

              {/* Pay Order button */}
              <Button
                className="w-full rounded-2xl text-lg font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95 disabled:opacity-70"
                style={{ height: "56px" }}
                disabled={isPending || !!pendingTransaction}
                onClick={() => {
                  if (!pendingTransaction) {
                    createTransaction({
                      invitationTemplateId: templateId,
                      invitationDurationId: durationKey,
                      paymentMethod: "qris",
                    })
                  } else {
                    setShowModal(true)
                  }
                }}
              >
                {isPending ? "Processing..." : pendingTransaction ? "Complete Payment" : t("payOrder")}
              </Button>

              {/* Security badge */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L7.414 9l3.293 3.293a1 1 0 01-1.414 1.414l-4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-zinc-500">{t("securedBy")}</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && pendingTransaction && (
        <PaymentModal
          transaction={pendingTransaction}
          onClose={() => {
            setShowModal(false)
            setPendingTransaction(null)
            localStorage.removeItem("pendingTransaction")
          }}
        />
      )}
    </div>
  )
}
