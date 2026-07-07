"use client"

import * as React from "react"
import Image from "next/image"
import { Pencil } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Account } from "@/lib/api/authentication/auth.types"

const COUNTRY_CODE = "+62"

function stripCountryCode(phone: string) {
  return phone.startsWith(COUNTRY_CODE) ? phone.slice(COUNTRY_CODE.length) : phone.replace(/^\+/, "")
}

type EditProfileDialogProps = {
  account: Account
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { name: string; phoneNumber: string }) => void
  isSaving: boolean
}

export function EditProfileDialog({ account, open, onOpenChange, onSave, isSaving }: EditProfileDialogProps) {
  const t = useTranslations("dashboard.profile.editDialog")
  const tProfile = useTranslations("dashboard.profile")
  const [name, setName] = React.useState(account.name)
  const [phoneLocal, setPhoneLocal] = React.useState(stripCountryCode(account.phoneNumber))

  // Reset form ke data terbaru tiap kali modal dibuka.
  React.useEffect(() => {
    if (open) {
      setName(account.name)
      setPhoneLocal(stripCountryCode(account.phoneNumber))
    }
  }, [open, account])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name: name.trim(), phoneNumber: `${COUNTRY_CODE}${phoneLocal.replace(/\s+/g, "")}` })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="flex justify-center">
            <div className="relative h-24 w-24">
              <div className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-white">
                {account.profilePicture ? (
                  <Image
                    src={account.profilePicture}
                    alt={account.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-2xl font-semibold text-indigo-700">
                    {account.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              {/* Ganti foto profil belum didukung backend — tombol ini dekoratif */}
              <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white ring-4 ring-white">
                <Pencil className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-profile-name">{tProfile("fullName")}</Label>
            <Input
              id="edit-profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-profile-email">{tProfile("emailAddress")}</Label>
            <Input id="edit-profile-email" value={account.email} disabled className="h-11 rounded-xl bg-zinc-50 text-zinc-400" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-profile-phone">{tProfile("phoneNumber")}</Label>
            <div className="flex gap-2">
              <span className="border-input flex h-11 w-16 shrink-0 items-center justify-center rounded-xl border bg-zinc-50 text-sm text-zinc-700">
                {COUNTRY_CODE}
              </span>
              <Input
                id="edit-profile-phone"
                value={phoneLocal}
                onChange={(e) => setPhoneLocal(e.target.value)}
                inputMode="numeric"
                className="h-11 flex-1 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl sm:w-32"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSaving} className="h-11 rounded-xl sm:flex-1">
              {isSaving ? "..." : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
