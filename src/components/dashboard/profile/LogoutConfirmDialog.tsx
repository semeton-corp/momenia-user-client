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
      <DialogContent showCloseButton={false} className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
          <LogOut className="h-7 w-7" />
        </div>
        <DialogTitle className="mt-5 text-center">{t("title")}</DialogTitle>
        <DialogDescription className="text-center">{t("description")}</DialogDescription>

        <div className="mt-8 flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1 rounded-xl text-sm font-semibold"
            onClick={() => onOpenChange(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            disabled={isLoggingOut}
            className="h-12 flex-1 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700"
            onClick={onConfirm}
          >
            {isLoggingOut ? "..." : t("confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
