"use client"

import { useTranslations } from "next-intl"
import { X } from "lucide-react"

type TermsAndConditionsModalProps = {
  onAccept: () => void
  onDecline: () => void
}

type TermSection = { title: string; body: string[] }

export function TermsAndConditionsModal({ onAccept, onDecline }: TermsAndConditionsModalProps) {
  const t = useTranslations("dashboard.payment")
  // Legal body text is sourced from messages/en.json and messages/id.json
  // (dashboard.payment.termsSections) so it follows the active locale like
  // every other string, instead of being a hardcoded English-only constant.
  const sections = t.raw("termsSections") as TermSection[]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4">
      <div className="flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl" style={{ maxHeight: "85vh" }}>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">{t("termsModalTitle")}</h2>
            <p className="text-xs text-zinc-400">{t("termsLastUpdated")}</p>
          </div>
          <button
            type="button"
            onClick={onDecline}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 text-base font-semibold text-zinc-900">{section.title}</h3>
              <div className="space-y-2">
                {section.body.map((paragraph, i) => (
                  <p key={i} className="text-sm leading-relaxed text-zinc-600">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="flex shrink-0 gap-3 border-t border-zinc-200 px-6 py-4">
          <button
            type="button"
            onClick={onDecline}
            className="flex-1 rounded-xl border border-zinc-300 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            {t("termsDecline")}
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            {t("termsAccept")}
          </button>
        </div>
      </div>
    </div>
  )
}
