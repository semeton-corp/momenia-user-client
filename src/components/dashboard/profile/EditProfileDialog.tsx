"use client"

import * as React from "react"
import Image from "next/image"
import { Loader2, Pencil } from "lucide-react"
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
import { useUploadAvatar } from "@/hooks/useUploadAvatar"
import { ACCEPTED_IMAGE_TYPES, toDisplayableImage } from "@/lib/heic"
import type { Account } from "@/lib/api/authentication/auth.types"

const COUNTRY_CODE = "+62"

function stripCountryCode(phone: string) {
  return phone.startsWith(COUNTRY_CODE) ? phone.slice(COUNTRY_CODE.length) : phone.replace(/^\+/, "")
}

type EditProfileDialogProps = {
  account: Account
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { name: string; phoneNumber: string; profilePicture: string }) => void
  isSaving: boolean
}

export function EditProfileDialog({ account, open, onOpenChange, onSave, isSaving }: EditProfileDialogProps) {
  const t = useTranslations("dashboard.profile.editDialog")
  const tProfile = useTranslations("dashboard.profile")
  const [name, setName] = React.useState(account.name)
  const [phoneLocal, setPhoneLocal] = React.useState(stripCountryCode(account.phoneNumber))
  const [profilePicture, setProfilePicture] = React.useState(account.profilePicture)
  // Preview pakai blob URL dari file lokal — URL final ("momenia/...") belum bisa
  // diakses sebelum Save, karena file masih di lokasi temp sampai backend
  // memindahkannya saat akun disimpan.
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [errorKey, setErrorKey] = React.useState<"uploadError" | "unsupportedFormat" | null>(null)
  const [converting, setConverting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar()

  const clearPreview = React.useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }, [])

  // Reset form ke data terbaru tiap kali modal dibuka.
  React.useEffect(() => {
    if (open) {
      setName(account.name)
      setPhoneLocal(stripCountryCode(account.phoneNumber))
      setProfilePicture(account.profilePicture)
      setErrorKey(null)
      clearPreview()
    }
  }, [open, account, clearPreview])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = "" // supaya bisa pilih file yang sama lagi kalau perlu
    if (!file) return

    setErrorKey(null)
    clearPreview()

    // Avatar tidak lewat crop modal, jadi tidak ada canvas re-encode yang
    // menormalkan formatnya — HEIC harus dikonversi di sini, kalau tidak ia terunggah
    // "berhasil" lalu tampil rusak di mana-mana.
    setConverting(true)
    let uploadable: File
    try {
      uploadable = await toDisplayableImage(file)
    } catch {
      setErrorKey("unsupportedFormat")
      return
    } finally {
      setConverting(false)
    }

    // Atribut accept bisa dilewati (drag-drop / "All Files"), jadi tetap pastikan
    // browser benar-benar bisa membaca hasilnya sebelum diunggah.
    const objectUrl = URL.createObjectURL(uploadable)
    const canDecode = await new Promise<boolean>((resolve) => {
      // window.Image, not the next/image component imported above under the same name.
      const probe = new window.Image()
      probe.onload = () => resolve(true)
      probe.onerror = () => resolve(false)
      probe.src = objectUrl
    })

    if (!canDecode) {
      URL.revokeObjectURL(objectUrl)
      setErrorKey("unsupportedFormat")
      return
    }

    setPreviewUrl(objectUrl)

    uploadAvatar(uploadable, {
      onSuccess: (url) => setProfilePicture(url),
      onError: () => {
        setErrorKey("uploadError")
        clearPreview() // balik ke foto lama kalau upload gagal
      },
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name: name.trim(), phoneNumber: `${COUNTRY_CODE}${phoneLocal.replace(/\s+/g, "")}`, profilePicture })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[calc(100vw-32px)] rounded-[10px] xl:min-h-[597px] xl:w-[528px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="flex flex-col items-center">
            <div className="relative h-24 w-24">
              <div className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-white">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt={name}
                    width={96}
                    height={96}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : account.profilePicture ? (
                  <Image
                    src={account.profilePicture}
                    alt={name}
                    width={96}
                    height={96}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-2xl font-semibold text-indigo-700">
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {(isUploading || converting) && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || converting}
                className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-white ring-4 ring-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {errorKey && (
              <p className="mt-2 text-xs text-destructive">{t(errorKey)}</p>
            )}
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
              className="h-10 rounded-[10px] sm:w-32"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSaving || isUploading} className="h-10 rounded-[10px] sm:flex-1">
              {isSaving ? "..." : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
