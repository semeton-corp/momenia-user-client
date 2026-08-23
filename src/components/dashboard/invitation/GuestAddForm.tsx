"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { GuestInvitationCategory } from "@/lib/api/guest-invitation-category/guest-invitation-category.types"
import { CategoryManagerSelect } from "./CategoryManagerSelect"
import { WorkspaceCard } from "./WorkspaceCard"
import { cn } from "@/lib/utils"

export type GuestFormValues = {
  name: string
  whatsAppNumber: string
  email: string
  guestInvitationCategoryId: string
}

export type EditingGuest = {
  id: string
  name: string
  whatsAppNumber: string
  email: string
  guestInvitationCategoryId: string
  isInvitationSent: boolean
  isAfterPartyNoteSent: boolean
}

type GuestAddFormProps = {
  addTitle: string
  editTitle: string
  nameLabel: string
  whatsAppLabel: string
  emailLabel: string
  categoryLabel: string
  chooseCategoryLabel: string
  categoryHint: string
  noCategoryOptionsLabel: string
  addCategoryLabel: string
  newCategoryPlaceholder: string
  nameRequiredLabel: string
  whatsAppRequiredLabel: string
  emailRequiredLabel: string
  emailInvalidLabel: string
  categoryRequiredLabel: string
  saveLabel: string
  cancelLabel: string
  categories: GuestInvitationCategory[]
  onCreateCategory: (name: string) => void
  isCreatingCategory?: boolean
  onUpdateCategory: (id: string, name: string) => void
  isUpdatingCategory?: boolean
  onDeleteCategory: (id: string) => void
  isDeletingCategory?: boolean
  editingGuest: EditingGuest | null
  onCancelEdit: () => void
  onSubmit: (values: GuestFormValues) => void
  isSubmitting?: boolean
}

const EMPTY_VALUES: GuestFormValues = { name: "", whatsAppNumber: "", email: "", guestInvitationCategoryId: "" }
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function GuestAddForm({
  addTitle,
  editTitle,
  nameLabel,
  whatsAppLabel,
  emailLabel,
  categoryLabel,
  chooseCategoryLabel,
  categoryHint,
  noCategoryOptionsLabel,
  addCategoryLabel,
  newCategoryPlaceholder,
  nameRequiredLabel,
  whatsAppRequiredLabel,
  emailRequiredLabel,
  emailInvalidLabel,
  categoryRequiredLabel,
  saveLabel,
  cancelLabel,
  categories,
  onCreateCategory,
  isCreatingCategory,
  onUpdateCategory,
  isUpdatingCategory,
  onDeleteCategory,
  isDeletingCategory,
  editingGuest,
  onCancelEdit,
  onSubmit,
  isSubmitting,
}: GuestAddFormProps) {
  const [values, setValues] = React.useState<GuestFormValues>(EMPTY_VALUES)
  const [errors, setErrors] = React.useState<Partial<Record<keyof GuestFormValues, string>>>({})

  React.useEffect(() => {
    setValues(
      editingGuest
        ? {
            name: editingGuest.name,
            whatsAppNumber: editingGuest.whatsAppNumber,
            email: editingGuest.email,
            guestInvitationCategoryId: editingGuest.guestInvitationCategoryId,
          }
        : EMPTY_VALUES
    )
    setErrors({})
  }, [editingGuest])

  const setField = <K extends keyof GuestFormValues>(key: K, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof GuestFormValues, string>> = {}
    if (!values.name.trim()) nextErrors.name = nameRequiredLabel
    if (!values.whatsAppNumber.trim()) nextErrors.whatsAppNumber = whatsAppRequiredLabel
    if (!values.email.trim()) nextErrors.email = emailRequiredLabel
    else if (!EMAIL_PATTERN.test(values.email.trim())) nextErrors.email = emailInvalidLabel
    if (!values.guestInvitationCategoryId) nextErrors.guestInvitationCategoryId = categoryRequiredLabel
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleCancel = () => {
    if (editingGuest) onCancelEdit()
    else {
      setValues(EMPTY_VALUES)
      setErrors({})
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      name: values.name.trim(),
      whatsAppNumber: values.whatsAppNumber.trim(),
      email: values.email.trim(),
      guestInvitationCategoryId: values.guestInvitationCategoryId,
    })
  }

  return (
    <WorkspaceCard className="h-fit px-4 py-4 sm:px-6 xl:p-8 border-0 shadow-none xl:border xl:shadow-sm">
      <h2 className="text-2xl font-semibold text-zinc-900">{editingGuest ? editTitle : addTitle}</h2>

      {/* Inner container */}
      <form onSubmit={handleSubmit} className="mt-4 rounded-[10px] border border-zinc-200 p-5">
        <div className="space-y-5">
          {/* Nama Lengkap */}
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-zinc-700">{nameLabel}</label>
            <Input
              placeholder="John Doe"
              value={values.name}
              onChange={(e) => setField("name", e.target.value)}
              className={cn("h-11 rounded-xl border-zinc-200", errors.name && "border-red-300")}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* WhatsApp */}
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-zinc-700">{whatsAppLabel}</label>
            <Input
              placeholder="08123456789"
              value={values.whatsAppNumber}
              // Buang semua yang bukan digit — biar huruf/simbol tidak bisa masuk sama
              // sekali (baik diketik maupun di-paste). inputMode="numeric" (bukan
              // type="number") supaya keyboard mobile numerik tanpa menghapus angka 0
              // di depan nomor Indonesia atau menampilkan spinner naik/turun.
              inputMode="numeric"
              onChange={(e) => setField("whatsAppNumber", e.target.value.replace(/\D/g, ""))}
              className={cn("h-11 rounded-xl border-zinc-200", errors.whatsAppNumber && "border-red-300")}
            />
            {errors.whatsAppNumber && <p className="text-xs text-red-500">{errors.whatsAppNumber}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-zinc-700">{emailLabel}</label>
            <Input
              placeholder="johndoe@gmail.com"
              value={values.email}
              onChange={(e) => setField("email", e.target.value)}
              className={cn("h-11 rounded-xl border-zinc-200", errors.email && "border-red-300")}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Kategori */}
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-zinc-700">{categoryLabel}</label>
            <CategoryManagerSelect
              placeholder={chooseCategoryLabel}
              hint={categories.length > 0 ? categoryHint : noCategoryOptionsLabel}
              value={values.guestInvitationCategoryId || null}
              onChange={(value) => setField("guestInvitationCategoryId", value)}
              error={errors.guestInvitationCategoryId}
              categories={categories}
              addCategoryLabel={addCategoryLabel}
              newCategoryPlaceholder={newCategoryPlaceholder}
              onCreate={onCreateCategory}
              isCreating={isCreatingCategory}
              onUpdate={onUpdateCategory}
              isUpdating={isUpdatingCategory}
              onDelete={onDeleteCategory}
              isDeleting={isDeletingCategory}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="h-12 flex-1 rounded-xl border-zinc-200 text-sm xl:h-10 xl:flex-none xl:px-6"
            >
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 flex-1 rounded-xl text-sm xl:h-10 xl:flex-none xl:px-6"
            >
              {saveLabel}
            </Button>
          </div>
        </div>
      </form>
    </WorkspaceCard>
  )
}
