"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"

const STAR_SHAPE = "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 92%, 50% 70%, 21% 92%, 32% 57%, 2% 35%, 39% 35%)"

export type InvitationFeedback = {
  invitationId: string
  templateId: string | null
  templateName: string | null
  locale: string
  rating: number
  comment: string
}

type FeedbackDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  invitationId: string
  locale: string
  templateId?: string
  templateName?: string
  onSubmit: (feedback: InvitationFeedback) => Promise<void>
}

export function FeedbackDialog({ open, onOpenChange, invitationId, locale, templateId, templateName, onSubmit }: FeedbackDialogProps) {
  const t = useTranslations("dashboard.workspace.overview.feedbackDialog")
  const [rating, setRating] = React.useState<number | null>(null)
  const [hoverRating, setHoverRating] = React.useState<number | null>(null)
  const [comment, setComment] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      setRating(null)
      setHoverRating(null)
      setComment("")
      setIsSubmitting(false)
      setSubmitError(null)
    }
  }, [open])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!rating || isSubmitting) return

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit({
        invitationId,
        templateId: templateId ?? null,
        templateName: templateName ?? null,
        locale,
        rating,
        comment: comment.trim(),
      })
      onOpenChange(false)
    } catch (error) {
      setSubmitError(error instanceof Error && error.message === "feedback_not_configured"
        ? t("notConfigured")
        : t("sendError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[560px] overflow-y-auto rounded-2xl p-7 sm:p-8">
        <DialogTitle className="pr-10 font-serif text-lg font-bold leading-tight text-[#1d2340] sm:text-xl">
          {t("title")}
        </DialogTitle>
        <DialogDescription className="sr-only">{t("description")}</DialogDescription>

        <form onSubmit={(event) => void handleSubmit(event)}>
          <div className="mt-5">
            <p className="sr-only" id="invitation-feedback-rating-label">{t("ratingLabel")}</p>
            <div role="group" aria-labelledby="invitation-feedback-rating-label" className="mx-auto grid max-w-[460px] grid-cols-10 gap-1.5">
              {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => {
                const previewRating = hoverRating ?? rating
                const isFilled = previewRating !== null && value <= previewRating

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={rating === value}
                    aria-label={t("ratingChoice", { rating: value })}
                    onClick={() => setRating(value)}
                    className="mx-auto grid aspect-square w-full max-w-9 cursor-pointer place-items-center transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    onPointerEnter={() => setHoverRating(value)}
                    onPointerLeave={() => setHoverRating(null)}
                    onBlur={() => setHoverRating(null)}
                  >
                    <span
                      className="grid size-full place-items-center transition-colors duration-150"
                      style={{ clipPath: STAR_SHAPE, backgroundColor: isFilled ? "#6500f5" : "#d7d9e5" }}
                    >
                      <span
                        className="grid place-items-center text-[11px] font-semibold sm:text-xs"
                        style={{
                          clipPath: STAR_SHAPE,
                          width: "calc(100% - 2px)",
                          height: "calc(100% - 2px)",
                          backgroundColor: isFilled ? "#6500f5" : "#ffffff",
                          color: isFilled ? "#ffffff" : "#25263a",
                        }}
                      >
                        {value}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="mx-auto mt-1 flex max-w-[440px] justify-between px-1 text-[10px] font-medium text-zinc-600 sm:text-[11px]">
              <span>{t("ratingLow")}</span>
              <span>{t("ratingHigh")}</span>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-lg border border-[#d9d7e8] bg-white p-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
            <label htmlFor="invitation-feedback-comment" className="sr-only">
              {t("commentLabel")}
            </label>
            <input
              id="invitation-feedback-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={500}
              placeholder={t("commentPlaceholder")}
              className="h-9 min-w-0 flex-1 bg-transparent px-2 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 sm:text-sm"
            />
            <input type="hidden" name="templateId" value={templateId ?? ""} />
            <Button type="submit" disabled={!rating || isSubmitting} className="h-9 min-w-14 rounded-md bg-[#6500f5] px-4 text-xs hover:bg-[#5700d4]">
              {isSubmitting ? t("sending") : t("submit")}
            </Button>
          </div>
          <p aria-live="polite" className="mt-2 text-[10px] leading-4 text-zinc-500 sm:text-[11px]">
            {submitError ?? t("helperText")}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
