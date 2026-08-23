"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { useToast } from "@/providers/ToastProvider"
import { useCreateGuestInvitation, useDeleteGuestInvitations, useGuestInvitations, useUpdateGuestInvitation } from "@/hooks/useGuestInvitations"
import {
  useCreateGuestInvitationCategory,
  useDeleteGuestInvitationCategory,
  useGuestInvitationCategories,
  useUpdateGuestInvitationCategory,
} from "@/hooks/useGuestInvitationCategories"
import { useInvitationMessage, useUpdateInvitationMessage } from "@/hooks/useInvitationMessage"
import { useUserInvitationDetail } from "@/hooks/useUserInvitations"
import type { GuestInvitation } from "@/lib/api/guest-invitation/guest-invitation.types"
import { DeleteGuestConfirmDialog } from "./DeleteGuestConfirmDialog"
import { GuestAddForm, type EditingGuest, type GuestFormValues } from "./GuestAddForm"
import { GuestMessageTemplateCard, stripLoneSurrogates, type TemplateVariable } from "./GuestMessageTemplateCard"
import { GuestMessageTemplateCardSkeleton } from "./GuestMessageTemplateCardSkeleton"
import { GuestsManagementTable } from "./GuestsManagementTable"
import { GuestsManagementTableSkeleton } from "./GuestsManagementTableSkeleton"

const DEFAULT_PAGE_SIZE = 10

type Props = {
  invitationId: string
}

export function GuestsWorkspaceClient({ invitationId }: Props) {
  const t = useTranslations("dashboard.workspace")
  const locale = useLocale()
  const { toast } = useToast()

  // Kosong sampai mount lalu diisi dari window.location.origin — link undangan
  // personal per-tamu (dipakai di Copy) harus ikut domain apa pun app-nya lagi
  // jalan (staging/prod/localhost), sama seperti pola di InvitationDashboardClient.
  const [origin, setOrigin] = React.useState("")
  React.useEffect(() => { setOrigin(window.location.origin) }, [])

  const [keyword, setKeyword] = React.useState("")
  const [debouncedKeyword, setDebouncedKeyword] = React.useState("")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE)
  const [cursor, setCursor] = React.useState<string | undefined>(undefined)
  const [cursorHistory, setCursorHistory] = React.useState<string[]>([])
  const [categoryFilter, setCategoryFilter] = React.useState<string | null>(null)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [editingGuest, setEditingGuest] = React.useState<EditingGuest | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false)

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedKeyword(keyword), 350)
    return () => clearTimeout(id)
  }, [keyword])

  React.useEffect(() => {
    setCursor(undefined)
    setCursorHistory([])
    setSelectedIds([])
  }, [debouncedKeyword, categoryFilter, pageSize, sortOrder])

  const { data: message, isLoading: isMessageLoading } = useInvitationMessage(invitationId)
  const { data: invitationDetail } = useUserInvitationDetail(invitationId)
  const { data: categories = [] } = useGuestInvitationCategories(invitationId)
  const { data: guestList, isLoading: isListLoading, isError: isListError } = useGuestInvitations(invitationId, {
    pageSize,
    cursor,
    keyword: debouncedKeyword || undefined,
    guestInvitationCategoryId: categoryFilter || undefined,
    sortField: "name",
    sortOrder,
  })

  const createMutation = useCreateGuestInvitation(invitationId)
  const updateMutation = useUpdateGuestInvitation(invitationId)
  const deleteMutation = useDeleteGuestInvitations(invitationId)
  const updateMessageMutation = useUpdateInvitationMessage(invitationId)
  const createCategoryMutation = useCreateGuestInvitationCategory(invitationId)
  const updateCategoryMutation = useUpdateGuestInvitationCategory(invitationId)
  const deleteCategoryMutation = useDeleteGuestInvitationCategory(invitationId)

  const categoryFilterOptions = React.useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories]
  )

  const guests = guestList?.data ?? []
  const totalData = guestList?.totalData ?? 0
  const totalPage = guestList?.totalPage ?? 1
  const currentPage = cursorHistory.length + 1

  const handleNextPage = () => {
    if (!guestList?.nextCursor) return
    setCursorHistory((prev) => [...prev, cursor ?? ""])
    setCursor(guestList.nextCursor)
  }

  const handlePrevPage = () => {
    setCursorHistory((prev) => {
      const next = [...prev]
      const last = next.pop()
      setCursor(last || undefined)
      return next
    })
  }

  const handleFirstPage = () => {
    setCursor(undefined)
    setCursorHistory([])
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) => (prev.length === guests.length ? [] : guests.map((g) => g.id)))
  }

  const handleEditGuest = (guest: GuestInvitation) => {
    setEditingGuest({
      id: guest.id,
      name: guest.name,
      whatsAppNumber: guest.whatsAppNumber,
      email: guest.email,
      guestInvitationCategoryId: guest.guestInvitationCategoryId,
      isInvitationSent: guest.isInvitationSent,
      isAfterPartyNoteSent: guest.isAfterPartyNoteSent,
    })
  }

  const handleSubmitForm = (values: GuestFormValues) => {
    if (editingGuest) {
      updateMutation.mutate(
        {
          id: editingGuest.id,
          data: {
            ...values,
            isInvitationSent: editingGuest.isInvitationSent,
            isAfterPartyNoteSent: editingGuest.isAfterPartyNoteSent,
          },
        },
        {
          onSuccess: () => {
            toast(t("guests.updatedToast"), "success")
            setEditingGuest(null)
          },
          onError: () => toast(t("guests.actionError"), "error"),
        }
      )
    } else {
      createMutation.mutate(
        { ...values, userInvitationId: invitationId },
        {
          onSuccess: () => toast(t("guests.addedToast"), "success"),
          onError: () => toast(t("guests.actionError"), "error"),
        }
      )
    }
  }

  const handleToggleDelivered = (guest: GuestInvitation) => {
    updateMutation.mutate(
      {
        id: guest.id,
        data: {
          name: guest.name,
          whatsAppNumber: guest.whatsAppNumber,
          email: guest.email,
          guestInvitationCategoryId: guest.guestInvitationCategoryId,
          isInvitationSent: !guest.isInvitationSent,
          isAfterPartyNoteSent: guest.isAfterPartyNoteSent,
        },
      },
      {
        onSuccess: () => toast(t("guests.deliveredStatusToast"), "success"),
        onError: () => toast(t("guests.actionError"), "error"),
      }
    )
  }

  const handleConfirmBulkDelete = () => {
    deleteMutation.mutate(selectedIds, {
      onSuccess: () => {
        toast(t("guests.deletedToast"), "success")
        setSelectedIds([])
        setBulkDeleteOpen(false)
      },
      onError: () => toast(t("guests.actionError"), "error"),
    })
  }

  const handleSaveTemplate = (rawBody: string) => {
    updateMessageMutation.mutate(
      { invitationMessage: rawBody },
      {
        onSuccess: () => toast(t("guests.messageTemplate.savedToast"), "success"),
        onError: () => toast(t("guests.actionError"), "error"),
      }
    )
  }

  const templateVariables: TemplateVariable[] = [
    { key: "guestName", label: t("guests.messageTemplate.variables.guestName") },
    { key: "eventName", label: t("guests.messageTemplate.variables.eventName") },
    { key: "eventDate", label: t("guests.messageTemplate.variables.eventDate") },
    { key: "invitationLink", label: t("guests.messageTemplate.variables.invitationLink") },
  ]

  // Sama seperti InvitationDashboardClient: gabungkan event_date + event_time
  // sebelum di-parse Date, supaya tidak salah geser tanggal di timezone dengan
  // offset UTC negatif (date-only string di-parse sebagai tengah malam UTC).
  const eventDateRaw = invitationDetail?.fieldValues?.event_date
  const eventDateObj = eventDateRaw
    ? new Date(`${eventDateRaw}T${invitationDetail?.fieldValues?.event_time || "00:00"}`)
    : null
  const eventDateLabel =
    eventDateObj && !Number.isNaN(eventDateObj.getTime())
      ? eventDateObj.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", { day: "numeric", month: "long", year: "numeric" })
      : ""

  // WhatsApp pakai *teks* buat bold — bungkus nilai (kalau tidak kosong) supaya
  // nama tamu/nama acara/tanggal tampil tebal di pesan yang di-copy/dikirim.
  const bold = (value: string) => (value ? `*${value}*` : "")

  // Substitusi tiap {{key}} di template tersimpan dengan data sungguhan tamu +
  // undangan ini, plus link personal berbasis ID (bukan nama) — format ini yang
  // sudah dibaca halaman publik lewat query param ?guestInvitationId=.
  // Link SENGAJA tidak dibungkus *bold* — WhatsApp auto-detect & warnai URL polos
  // jadi biru + bisa diklik; asterisk di sekitarnya berisiko mengganggu deteksi itu.
  const buildGuestMessage = (guest: GuestInvitation) => {
    const template = message?.invitationMessage || t("guests.messageTemplate.defaultBody")
    const invitationLink = invitationDetail?.slug
      ? `${origin}/${locale}/invitation/${invitationDetail.slug}?guestInvitationId=${guest.id}`
      : ""
    const substituted = template
      .replace(/\{\{guestName\}\}/g, bold(guest.name))
      .replace(/\{\{eventName\}\}/g, bold(invitationDetail?.name ?? ""))
      .replace(/\{\{eventDate\}\}/g, bold(eventDateLabel))
      .replace(/\{\{invitationLink\}\}/g, invitationLink)
    return stripLoneSurrogates(substituted)
  }

  const handleCopyGuestMessage = async (guest: GuestInvitation) => {
    try {
      await navigator.clipboard.writeText(buildGuestMessage(guest))
      toast(t("guests.messageTemplate.copiedToast"), "success")
    } catch {
      toast(t("guests.actionError"), "error")
    }
  }

  // Format lokal Indonesia ("0812...") jadi format internasional wa.me ("62812...")
  // — wa.me tidak menerima nomor berawalan 0.
  const toWhatsAppNumber = (raw: string) => {
    const digits = raw.replace(/\D/g, "")
    return digits.startsWith("0") ? `62${digits.slice(1)}` : digits
  }

  const handleSendWhatsApp = (guest: GuestInvitation) => {
    const text = buildGuestMessage(guest)
    const phone = toWhatsAppNumber(guest.whatsAppNumber)
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer")
  }

  const handleCreateCategory = (name: string) => {
    createCategoryMutation.mutate(
      { name, userInvitationId: invitationId },
      {
        onSuccess: () => toast(t("guests.categoryAddedToast"), "success"),
        onError: () => toast(t("guests.actionError"), "error"),
      }
    )
  }

  const handleUpdateCategory = (id: string, name: string) => {
    updateCategoryMutation.mutate(
      { id, data: { name } },
      {
        onSuccess: () => toast(t("guests.categoryUpdatedToast"), "success"),
        onError: () => toast(t("guests.actionError"), "error"),
      }
    )
  }

  const handleDeleteCategory = (id: string) => {
    deleteCategoryMutation.mutate(id, {
      onSuccess: () => toast(t("guests.categoryDeletedToast"), "success"),
      onError: () => toast(t("guests.actionError"), "error"),
    })
  }

  const emptyLabel = debouncedKeyword || categoryFilter ? t("guests.noResults") : t("guests.empty")

  return (
    <>
      <div className="min-w-0 -mx-4 sm:-mx-6 xl:mx-0">
        {isMessageLoading ? (
          <GuestMessageTemplateCardSkeleton />
        ) : (
          <GuestMessageTemplateCard
            title={t("guests.messageTemplate.title")}
            body={message?.invitationMessage || t("guests.messageTemplate.defaultBody")}
            variables={templateVariables}
            helperText={t("guests.messageTemplate.helperText")}
            saveLabel={t("guests.messageTemplate.save")}
            onSave={handleSaveTemplate}
            onExceedsLimit={() => toast(t("guests.messageTemplate.tooLongToast"), "error")}
            isSaving={updateMessageMutation.isPending}
          />
        )}
      </div>

      <div className="grid gap-6 xl:gap-9 xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* Form: first on mobile, right column on desktop */}
        <div className="min-w-0 -mx-4 sm:-mx-6 xl:mx-0 xl:order-last">
          <GuestAddForm
            addTitle={t("guests.addTitle")}
            editTitle={t("guests.editTitle")}
            nameLabel={t("guests.form.name")}
            whatsAppLabel={t("guests.form.whatsApp")}
            emailLabel={t("guests.form.email")}
            categoryLabel={t("guests.form.category")}
            chooseCategoryLabel={t("guests.form.chooseCategory")}
            categoryHint={t("guests.form.categoryHint")}
            noCategoryOptionsLabel={t("guests.form.noCategoryOptions")}
            addCategoryLabel={t("guests.form.addCategory")}
            newCategoryPlaceholder={t("guests.form.newCategoryPlaceholder")}
            nameRequiredLabel={t("guests.form.nameRequired")}
            whatsAppRequiredLabel={t("guests.form.whatsAppRequired")}
            emailRequiredLabel={t("guests.form.emailRequired")}
            emailInvalidLabel={t("guests.form.emailInvalid")}
            categoryRequiredLabel={t("guests.form.categoryRequired")}
            saveLabel={t("common.save")}
            cancelLabel={t("common.cancel")}
            categories={categories}
            onCreateCategory={handleCreateCategory}
            isCreatingCategory={createCategoryMutation.isPending}
            onUpdateCategory={handleUpdateCategory}
            isUpdatingCategory={updateCategoryMutation.isPending}
            onDeleteCategory={handleDeleteCategory}
            isDeletingCategory={deleteCategoryMutation.isPending}
            editingGuest={editingGuest}
            onCancelEdit={() => setEditingGuest(null)}
            onSubmit={handleSubmitForm}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </div>

        {/* Table: second on mobile, left column on desktop */}
        <div className="min-w-0 -mx-4 sm:-mx-6 xl:mx-0 xl:order-first">
          {isListLoading ? (
            <GuestsManagementTableSkeleton />
          ) : isListError ? (
            <p className="text-sm text-zinc-400">{t("guests.loadError")}</p>
          ) : (
            <GuestsManagementTable
              title={t("guests.listTitle")}
              searchPlaceholder={t("common.searchGuests")}
              totalLabel={t("guests.totalGuests", { count: totalData })}
              sortLabel={t("common.sort")}
              deleteLabel={t("guests.deleteRows")}
              nameLabel={t("guests.table.name")}
              whatsAppLabel={t("guests.table.whatsApp")}
              emailLabel={t("guests.table.email")}
              categoryLabel={t("guests.table.category")}
              allCategoriesLabel={t("guests.table.allCategories")}
              actionsLabel={t("guests.table.actions")}
              deliveredLabel={t("guests.table.delivered")}
              emptyLabel={emptyLabel}
              guests={guests}
              searchValue={keyword}
              onSearchChange={setKeyword}
              onSortToggle={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
              categoryOptions={categoryFilterOptions}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onDeleteSelected={() => selectedIds.length > 0 && setBulkDeleteOpen(true)}
              onEditGuest={handleEditGuest}
              onToggleDelivered={handleToggleDelivered}
              onCopyGuestMessage={handleCopyGuestMessage}
              onSendWhatsApp={handleSendWhatsApp}
              togglingDeliveredId={updateMutation.isPending ? updateMutation.variables?.id : null}
              selectionLabel={t("common.selectedRows", { count: selectedIds.length, total: totalData })}
              rowsPerPageLabel={t("common.rowsPerPage")}
              pageLabel={t("common.pageLabel", { current: currentPage, total: totalPage })}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              canGoPrev={cursorHistory.length > 0}
              canGoNext={!!guestList?.nextCursor}
              onFirstPage={handleFirstPage}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
            />
          )}
        </div>
      </div>

      <DeleteGuestConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={handleConfirmBulkDelete}
        isDeleting={deleteMutation.isPending}
        count={selectedIds.length}
      />
    </>
  )
}
