"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { buildWhatsAppUrl } from "@/lib/whatsapp"

const EVENT_KEYS = ["wedding", "engagement", "birthday", "other"] as const
type EventKey = (typeof EVENT_KEYS)[number]

const S = {
  label: "text-zinc-800",
  field: "border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-primary/30",
  chip: "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
  chipActive: "border-primary bg-primary text-primary-foreground",
  submit: "bg-primary text-primary-foreground hover:bg-primary/90",
  error: "text-red-500",
}

const FIELD_BASE =
  "w-full rounded-[10px] border px-3.5 py-2.5 text-base outline-none md:text-sm transition focus-visible:ring-[3px]"

type CustomTemplateFormProps = {
  /** Dipanggil setelah WhatsApp dibuka — mis. untuk menutup pop-up. */
  onSubmitted?: () => void
  className?: string
}

/**
 * Form brief "Custom Template": tidak memanggil API — brief dirangkai jadi satu pesan
 * lalu dibuka di WhatsApp ke nomor Momenia (user tinggal menekan kirim di sana).
 * Dipakai di section landing dan pop-up dashboard.
 */
export function CustomTemplateForm({ onSubmitted, className }: CustomTemplateFormProps) {
  const t = useTranslations("customTemplate")
  const s = S
  const uid = React.useId()

  const [name, setName] = React.useState("")
  const [eventKey, setEventKey] = React.useState<EventKey>("wedding")
  const [idea, setIdea] = React.useState("")
  const [showError, setShowError] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setShowError(true)
      return
    }

    const lines = [
      t("whatsapp.intro"),
      "",
      `${t("whatsapp.name")}: ${name.trim()}`,
      `${t("whatsapp.event")}: ${t(`events.${eventKey}`)}`,
    ]
    if (idea.trim()) lines.push(`${t("whatsapp.idea")}: ${idea.trim()}`)

    window.open(buildWhatsAppUrl(lines.join("\n")), "_blank", "noopener,noreferrer")
    onSubmitted?.()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${uid}-name`} className={cn("text-xs font-semibold", s.label)}>
          {t("form.name")}
        </label>
        <input
          id={`${uid}-name`}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setShowError(false)
          }}
          maxLength={80}
          placeholder={t("form.namePlaceholder")}
          aria-invalid={showError}
          className={cn(FIELD_BASE, s.field, showError && "ring-[3px] ring-red-400/60")}
        />
        {showError && <p className={cn("text-xs font-medium", s.error)}>{t("form.nameRequired")}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={cn("text-xs font-semibold", s.label)}>{t("form.event")}</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("form.event")}>
          {EVENT_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={eventKey === key}
              onClick={() => setEventKey(key)}
              className={cn(
                "cursor-pointer rounded-[10px] border px-3.5 py-2 text-sm font-semibold transition-colors",
                eventKey === key ? s.chipActive : s.chip,
              )}
            >
              {t(`events.${key}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${uid}-idea`} className={cn("text-xs font-semibold", s.label)}>
          {t("form.idea")}
        </label>
        <textarea
          id={`${uid}-idea`}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          maxLength={600}
          rows={4}
          placeholder={t("form.ideaPlaceholder")}
          className={cn(FIELD_BASE, s.field, "resize-none")}
        />
      </div>

      <button
        type="submit"
        className={cn(
          "mt-1 w-full cursor-pointer rounded-[10px] px-4 py-3 text-sm font-semibold transition-colors",
          s.submit,
        )}
      >
        {t("form.submit")}
      </button>
    </form>
  )
}
