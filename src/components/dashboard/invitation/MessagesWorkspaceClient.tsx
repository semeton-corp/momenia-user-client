"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { useToast } from "@/providers/ToastProvider"
import {
  useDeleteGuestInvitationMessage,
  useGuestInvitationMessages,
  useUpdateGuestInvitationMessage,
} from "@/hooks/useGuestMessages"
import { DeleteMessageConfirmDialog } from "./DeleteMessageConfirmDialog"
import { GuestMessageCard } from "./GuestMessageCard"
import { GuestMessageCardSkeleton } from "./GuestMessageCardSkeleton"

// API mengirim timestamp gaya Go, mis. "2026-06-18 22:08:32.861282 +0700 +07".
// Tanggal "0001-01-01" adalah nilai kosong/placeholder dari backend (belum
// pernah di-set), jadi tidak ditampilkan sama sekali.
function formatMessageDate(raw: string): string {
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(?:\.\d+)?\s*([+-]\d{2}:?\d{2})?/)
  if (!match) return ""
  const [, datePart, timePart, offsetRaw] = match
  if (datePart.startsWith("0001")) return ""
  const offset = offsetRaw ? offsetRaw.replace(/^([+-]\d{2})(\d{2})$/, "$1:$2") : "Z"
  const date = new Date(`${datePart}T${timePart}${offset}`)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
}

type Props = {
  invitationId: string
}

export function MessagesWorkspaceClient({ invitationId }: Props) {
  const t = useTranslations("dashboard.workspace.messages")
  const tCommon = useTranslations("dashboard.workspace.common")
  const { toast } = useToast()

  const [keyword, setKeyword] = React.useState("")
  const [debouncedKeyword, setDebouncedKeyword] = React.useState("")
  const [pendingDelete, setPendingDelete] = React.useState<{ id: string; name: string } | null>(null)

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedKeyword(keyword), 350)
    return () => clearTimeout(id)
  }, [keyword])

  const { data: messages, isLoading, isError } = useGuestInvitationMessages(invitationId, {
    keyword: debouncedKeyword || undefined,
  })
  const updateMutation = useUpdateGuestInvitationMessage(invitationId)
  const deleteMutation = useDeleteGuestInvitationMessage(invitationId)

  const handleToggleHide = (id: string, nextHidden: boolean) => {
    updateMutation.mutate(
      { id, data: { isMessageHidden: nextHidden } },
      {
        onSuccess: () => toast(nextHidden ? t("hiddenToast") : t("shownToast"), "success"),
        onError: () => toast(t("actionError"), "error"),
      },
    )
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    deleteMutation.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast(t("deletedToast"), "success")
        setPendingDelete(null)
      },
      onError: () => toast(t("actionError"), "error"),
    })
  }

  return (
    <>
      <Input
        aria-label={t("searchPlaceholder")}
        placeholder={t("searchPlaceholder")}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="h-12 border-zinc-200"
      />

      <div className="mt-6 xl:columns-2 xl:gap-4 space-y-4 xl:space-y-0">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="break-inside-avoid mb-4">
              <GuestMessageCardSkeleton />
            </div>
          ))
        ) : isError ? (
          <p className="text-sm text-zinc-400">{t("loadError")}</p>
        ) : !messages || messages.length === 0 ? (
          <p className="text-sm text-zinc-400">{t("empty")}</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="break-inside-avoid mb-4">
              <GuestMessageCard
                name={message.name}
                content={message.message}
                dateLabel={formatMessageDate(message.messageAt)}
                voiceNote={message.voiceNote || undefined}
                voiceLabel={t("voiceNote", { name: message.name })}
                isHidden={message.isMessageHidden}
                hiddenBadgeLabel={t("hiddenBadge")}
                hideLabel={tCommon("hide")}
                showLabel={tCommon("show")}
                deleteLabel={tCommon("delete")}
                onToggleHide={() => handleToggleHide(message.id, !message.isMessageHidden)}
                onDelete={() => setPendingDelete({ id: message.id, name: message.name })}
                isToggling={updateMutation.isPending && updateMutation.variables?.id === message.id}
                isDeleting={deleteMutation.isPending && deleteMutation.variables === message.id}
              />
            </div>
          ))
        )}
      </div>

      <DeleteMessageConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
        senderName={pendingDelete?.name}
      />
    </>
  )
}
