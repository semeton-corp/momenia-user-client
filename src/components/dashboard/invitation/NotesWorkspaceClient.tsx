"use client"

import * as React from "react"
import { ClipboardList, UsersRound } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/providers/ToastProvider"
import { useAfterPartyNote, useUpdateAfterPartyNote } from "@/hooks/useAfterPartyNote"
import { useGuestInvitations } from "@/hooks/useGuestInvitations"
import { AfterPartyNoteFormSkeleton } from "./AfterPartyNoteFormSkeleton"
import { AfterPartyRecipientsTable } from "./AfterPartyRecipientsTable"
import { AfterPartyRecipientsTableSkeleton } from "./AfterPartyRecipientsTableSkeleton"
import { WorkspaceCard } from "./WorkspaceCard"

const DEFAULT_PAGE_SIZE = 10

type Props = {
  invitationId: string
}

export function NotesWorkspaceClient({ invitationId }: Props) {
  const t = useTranslations("dashboard.workspace.notes")
  const tCommon = useTranslations("dashboard.workspace.common")
  const tGuests = useTranslations("dashboard.workspace.guests")
  const { toast } = useToast()

  const [souvenir, setSouvenir] = React.useState("")
  const [message, setMessage] = React.useState("")

  const [keyword, setKeyword] = React.useState("")
  const [debouncedKeyword, setDebouncedKeyword] = React.useState("")
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE)
  const [cursor, setCursor] = React.useState<string | undefined>(undefined)
  const [cursorHistory, setCursorHistory] = React.useState<string[]>([])

  const { data: note, isLoading: isNoteLoading } = useAfterPartyNote(invitationId)
  const updateMutation = useUpdateAfterPartyNote(invitationId)

  React.useEffect(() => {
    if (note) {
      setSouvenir(note.onlineSouvenir)
      setMessage(note.afterPartyNote)
    }
  }, [note])

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedKeyword(keyword), 350)
    return () => clearTimeout(id)
  }, [keyword])

  React.useEffect(() => {
    setCursor(undefined)
    setCursorHistory([])
  }, [debouncedKeyword, pageSize])

  const { data: guestList, isLoading: isListLoading, isError: isListError } = useGuestInvitations(invitationId, {
    pageSize,
    cursor,
    keyword: debouncedKeyword || undefined,
    sortField: "name",
  })

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

  const handleSave = () => {
    updateMutation.mutate(
      { afterPartyNote: message, onlineSouvenir: souvenir },
      {
        onSuccess: () => toast(t("savedToast"), "success"),
        onError: () => toast(t("actionError"), "error"),
      }
    )
  }

  return (
    <div className="grid gap-y-4 gap-x-12 lg:grid-cols-[460px_minmax(0,1fr)] lg:items-start">

      {/* ── Stepper (desktop): spans both columns ── */}
      <div className="hidden lg:col-span-2 lg:flex lg:items-center">
        <div className="flex w-115 shrink-0 items-center gap-2 rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-3 text-xl font-medium text-indigo-700">
          <ClipboardList className="h-7 w-7 shrink-0" />
          <span>{t("stepOne")}</span>
        </div>
        <div className="w-12 shrink-0 border-t-2 border-dashed border-zinc-300" />
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xl font-medium text-zinc-400">
          <UsersRound className="h-7 w-7 shrink-0" />
          <span>{t("stepTwo")}</span>
        </div>
      </div>

      {/* ── Step 1 pill (mobile only) ── */}
      <div className="flex items-center gap-2 rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 lg:hidden">
        <ClipboardList className="h-4 w-4 shrink-0" />
        <span>{t("stepOne")}</span>
      </div>

      {/* ── Form card: column 1 ── */}
      <div className="min-w-0 -mx-4 sm:-mx-6 lg:mx-0">
        {isNoteLoading ? (
          <AfterPartyNoteFormSkeleton />
        ) : (
          <WorkspaceCard className="h-fit px-4 py-4 sm:px-6 lg:p-8 border-0 shadow-none lg:border lg:shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground">{t("formTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground lg:text-base">{t("formSubtitle")}</p>

            <div className="mt-4 rounded-[10px] border border-zinc-200 p-5 lg:mt-8 lg:p-6">
              <div className="space-y-4 lg:space-y-7">
                <div className="space-y-1.5 lg:space-y-3">
                  <label className="text-sm font-medium text-card-foreground">{t("souvenirLabel")}</label>
                  <Input
                    placeholder={t("souvenirPlaceholder")}
                    value={souvenir}
                    onChange={(e) => setSouvenir(e.target.value)}
                    className="h-10 rounded-xl border-zinc-200"
                  />
                </div>

                <div className="space-y-1.5 lg:space-y-3">
                  <label className="text-sm font-medium text-card-foreground">{t("messageLabel")}</label>
                  <textarea
                    placeholder={t("messagePlaceholder")}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-28 w-full resize-none rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-700 outline-none placeholder:text-zinc-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  />
                  <p className="text-xs text-zinc-400">{t("messageHint")}</p>
                </div>

                <div className="flex justify-end pt-1">
                  <Button disabled={updateMutation.isPending} onClick={handleSave} className="rounded-xl px-6">
                    {tCommon("save")}
                  </Button>
                </div>
              </div>
            </div>
          </WorkspaceCard>
        )}
      </div>

      {/* ── Step 2 pill (mobile only) — below form, above table ── */}
      <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-400 lg:hidden">
        <UsersRound className="h-4 w-4 shrink-0" />
        <span>{t("stepTwo")}</span>
      </div>

      {/* ── Recipients table: column 2 ── */}
      <div className="min-w-0 -mx-4 sm:-mx-6 lg:mx-0">
        {isListLoading ? (
          <AfterPartyRecipientsTableSkeleton />
        ) : isListError ? (
          <p className="text-sm text-zinc-400">{t("recipientsLoadError")}</p>
        ) : (
          <AfterPartyRecipientsTable
            title={t("recipientTitle")}
            subtitle={t("recipientSubtitle")}
            searchPlaceholder={tCommon("searchGuests")}
            nameLabel={tGuests("table.name")}
            categoryLabel={tGuests("table.category")}
            actionsLabel={tGuests("table.actions")}
            deliveredLabel={tGuests("table.delivered")}
            emptyLabel={tGuests("empty")}
            selectionLabel={tCommon("selectedRows", { count: 0, total: totalData })}
            rowsPerPageLabel={tCommon("rowsPerPage")}
            pageLabel={tCommon("pageLabel", { current: currentPage, total: totalPage })}
            guests={guests}
            searchValue={keyword}
            onSearchChange={setKeyword}
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
  )
}
