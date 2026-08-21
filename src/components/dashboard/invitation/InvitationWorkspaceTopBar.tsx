"use client"

import * as React from "react"
import { House, PencilLine } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { useUpdateUserInvitation, useUserInvitationDetail } from "@/hooks/useUserInvitations"
import { useToast } from "@/providers/ToastProvider"

type Props = {
  readonly invitationId: string
}

// Header mobile ini dipakai di semua halaman workspace (Dashboard/Edit/Guests/RSVP/
// Notes/Messages) lewat layout.tsx, jadi punya query & mutation sendiri (bukan reuse
// state dari InvitationDashboardClient) — cache-nya tetap sama lewat React Query.
// Mekanisme rename-nya sama persis dengan yang di desktop: tekan pensil, ketik,
// Enter untuk simpan (PUT langsung ke API), Escape/blur untuk batal.
export function InvitationWorkspaceTopBar({ invitationId }: Props) {
  const t = useTranslations("dashboard.workspace")
  const { toast } = useToast()
  const { data } = useUserInvitationDetail(invitationId)
  const titleMutation = useUpdateUserInvitation(invitationId)

  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [titleDraft, setTitleDraft] = React.useState("")
  const [isSavingTitle, setIsSavingTitle] = React.useState(false)

  const title = data?.name ?? ""

  const startEditingTitle = () => {
    setTitleDraft(title)
    setIsEditingTitle(true)
  }

  const cancelEditingTitle = () => {
    setIsEditingTitle(false)
    setTitleDraft(title)
  }

  const saveTitle = async () => {
    if (!data) return
    const trimmed = titleDraft.trim()
    if (!trimmed) {
      toast(t("overview.titleRequired"), "error")
      return
    }
    if (trimmed === title) {
      setIsEditingTitle(false)
      return
    }

    setIsSavingTitle(true)
    try {
      await titleMutation.mutateAsync({
        name: trimmed,
        slug: data.slug,
        fieldValues: data.fieldValues,
        status: data.status,
        template: data.template,
      })
      toast(t("overview.titleUpdatedToast"), "success")
      setIsEditingTitle(false)
    } catch {
      toast(t("overview.actionError"), "error")
    } finally {
      setIsSavingTitle(false)
    }
  }

  return (
    <header
      className="fixed left-0 right-0 top-0 z-40 flex items-center justify-center gap-1.5 lg:hidden"
      style={{ background: "#FAFAFA", borderBottom: "1px solid #E5E5E5", height: "60px" }}
    >
      {/* Home balik ke posisi tetap di kiri (di luar flow flex), TIDAK ikut ke tengah. */}
      <Link
        href={`/dashboard/my-invitation/${invitationId}`}
        className="absolute left-4 flex items-center justify-center"
      >
        <House className="h-6 w-6" style={{ color: "#4F46E5" }} />
      </Link>

      {/* Spacer tak terlihat, lebarnya sama dengan slot pensil di kanan — supaya
          judul tetap simetris & benar-benar di tengah header, terlepas dari posisi
          home (yang sekarang absolute, di luar hitungan center flex ini). */}
      <span className="size-8 shrink-0" aria-hidden="true" />

      {isEditingTitle ? (
        <input
          autoFocus
          value={titleDraft}
          disabled={isSavingTitle}
          onChange={(e) => setTitleDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              saveTitle()
            } else if (e.key === "Escape") {
              e.preventDefault()
              cancelEditingTitle()
            }
          }}
          onBlur={cancelEditingTitle}
          aria-label={t("overview.editTitle")}
          className="min-w-0 max-w-[55%] rounded-lg border border-indigo-300 bg-white px-2 py-1 text-center text-base font-semibold leading-tight text-zinc-800 outline-none focus:ring-2 focus:ring-indigo-100"
        />
      ) : (
        <span className="min-w-0 max-w-[55%] truncate text-center text-base font-semibold leading-tight text-zinc-800">
          {title}
        </span>
      )}

      {/* Slot kanan selalu memesan lebar size-8 yang sama dengan home, baik lagi
          menampilkan tombol pensil maupun kosong (saat data belum ada / sedang edit)
          — supaya simetrinya tidak goyah di kondisi apa pun. */}
      {!isEditingTitle && data ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={startEditingTitle}
          aria-label={t("overview.editTitle")}
          className="size-8 shrink-0 rounded-full text-zinc-400 hover:text-zinc-600"
        >
          <PencilLine className="size-4" />
        </Button>
      ) : (
        <span className="size-8 shrink-0" aria-hidden="true" />
      )}
    </header>
  )
}
