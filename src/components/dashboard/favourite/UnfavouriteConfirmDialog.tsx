"use client"

import { HeartCrack } from "lucide-react"
import { useTranslations } from "next-intl"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type UnfavouriteConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  templateName?: string
}

export function UnfavouriteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  templateName,
}: UnfavouriteConfirmDialogProps) {
  const t = useTranslations("dashboard.favourite.unfavouriteDialog")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex w-full max-w-[calc(100vw-32px)] flex-col items-center rounded-[10px] p-8 text-center xl:w-[601px] xl:p-10"
      >
        <div className="mx-auto flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 xl:h-[98px] xl:w-[98px]">
          <HeartCrack className="h-10 w-10 xl:h-12 xl:w-12" />
        </div>
        <DialogTitle className="mt-6 text-center text-2xl font-semibold text-[#000000]">{t("title")}</DialogTitle>
        <DialogDescription className="mt-2 text-center text-sm font-normal text-[#000000]">
          {templateName ? t("descriptionNamed", { name: templateName }) : t("description")}
        </DialogDescription>

        <div className="mt-10 flex w-full flex-col gap-3 xl:w-auto xl:flex-row xl:gap-6">
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full rounded-[10px] text-sm font-semibold xl:w-[252.5px]"
            onClick={() => onOpenChange(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            className="h-10 w-full rounded-[10px] bg-red-600 text-sm font-semibold text-white hover:bg-red-700 xl:w-[252.5px]"
            onClick={onConfirm}
          >
            {t("confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
