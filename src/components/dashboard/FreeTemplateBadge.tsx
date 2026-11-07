"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

type FreeTemplateBadgeProps = {
  className?: string
  size?: "card" | "detail"
}

export function FreeTemplateBadge({ className, size = "card" }: FreeTemplateBadgeProps) {
  const t = useTranslations("dashboard.modal")

  return (
    <span
      role="note"
      aria-label={t("free")}
      className={cn(
        "pointer-events-none inline-flex -rotate-6 items-center justify-center whitespace-nowrap rounded-full border-2 border-white bg-primary font-extrabold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/30",
        size === "card" ? "px-6 py-2.5 text-base" : "px-3.5 py-2 text-xs",
        className,
      )}
    >
      {t("free")}
    </span>
  )
}
