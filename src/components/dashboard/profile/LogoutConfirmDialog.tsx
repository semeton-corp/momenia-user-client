"use client"

import { LogOut } from "lucide-react"
import { useTranslations } from "next-intl"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type LogoutConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoggingOut: boolean
}

export function LogoutConfirmDialog({ open, onOpenChange, onConfirm, isLoggingOut }: LogoutConfirmDialogProps) {
  const t = useTranslations("dashboard.profile.logoutDialog")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex w-full max-w-[calc(100vw-32px)] flex-col items-center rounded-[10px] p-6 text-center xl:h-[334px] xl:w-[601px] xl:p-9"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600 xl:h-[98px] xl:w-[98px]">
          <LogOut className="h-7 w-7" />
        </div>
        <DialogTitle className="mt-5 text-center text-2xl font-semibold text-[#000000]">{t("title")}</DialogTitle>
        <DialogDescription className="text-center text-sm font-normal text-[#000000]">{t("description")}</DialogDescription>

        <div className="mt-8 flex w-full flex-col gap-3 xl:w-auto xl:flex-row xl:gap-6">
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
            disabled={isLoggingOut}
            className="h-10 w-full rounded-[10px] bg-red-600 text-sm font-semibold text-white hover:bg-red-700 xl:w-[252.5px]"
            onClick={onConfirm}
          >
            {isLoggingOut ? "..." : t("confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
