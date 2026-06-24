import { ClipboardList, UsersRound } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AfterPartyRecipientsTable } from "@/components/dashboard/invitation/AfterPartyRecipientsTable"
import { InvitationWorkspaceHeader } from "@/components/dashboard/invitation/InvitationWorkspaceHeader"
import { WorkspaceCard } from "@/components/dashboard/invitation/WorkspaceCard"
import { getInvitationWorkspaceData } from "@/lib/mocks/invitation-workspace"

type Props = {
  readonly params: Promise<{ locale: string; invitationId: string }>
}

export default async function NotesPage({ params }: Props) {
  const { locale, invitationId } = await params
  const t = await getTranslations("dashboard.workspace")
  const data = getInvitationWorkspaceData(invitationId, locale)

  return (
    <div className="space-y-4 xl:space-y-10 xl:pl-8 xl:pt-6">

      {/* Header — hidden on mobile */}
      <div className="hidden xl:block">
        <InvitationWorkspaceHeader title={t("notes.title")} subtitle={data.title} />
      </div>

      <div className="grid gap-y-4 gap-x-12 lg:grid-cols-[460px_minmax(0,1fr)] lg:items-start">

        {/* ── Stepper (desktop): spans both columns ── */}
        <div className="hidden lg:col-span-2 lg:flex lg:items-center">
          <div className="flex w-115 shrink-0 items-center gap-2 rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-3 text-xl font-medium text-indigo-700">
            <ClipboardList className="h-7 w-7 shrink-0" />
            <span>{t("notes.stepOne")}</span>
          </div>
          <div className="w-12 shrink-0 border-t-2 border-dashed border-zinc-300" />
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xl font-medium text-zinc-400">
            <UsersRound className="h-7 w-7 shrink-0" />
            <span>{t("notes.stepTwo")}</span>
          </div>
        </div>

        {/* ── Step 1 pill (mobile only) ── */}
        <div className="flex items-center gap-2 rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 lg:hidden">
          <ClipboardList className="h-4 w-4 shrink-0" />
          <span>{t("notes.stepOne")}</span>
        </div>

        {/* ── Form card: column 1 ── */}
        <div className="min-w-0 -mx-4 sm:-mx-6 lg:mx-0">
          <WorkspaceCard className="h-fit px-4 py-4 sm:px-6 lg:p-8 border-0 shadow-none lg:border lg:shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground">{t("notes.formTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground lg:text-base">{t("notes.formSubtitle")}</p>

            <div className="mt-4 rounded-[10px] border border-zinc-200 p-5 lg:mt-8 lg:p-6">
              <div className="space-y-4 lg:space-y-7">
                <div className="space-y-1.5 lg:space-y-3">
                  <label className="text-sm font-medium text-card-foreground">{t("notes.galleryLink")}</label>
                  <Input
                    placeholder="https/..."
                    defaultValue={data.afterPartyNote.galleryUrl}
                    className="h-10 rounded-xl border-zinc-200"
                  />
                </div>

                <div className="space-y-1.5 lg:space-y-3">
                  <label className="text-sm font-medium text-card-foreground">{t("notes.souvenirLabel")}</label>
                  <Input
                    placeholder="johndoe@gmail.com"
                    defaultValue={data.afterPartyNote.souvenirLabel}
                    className="h-10 rounded-xl border-zinc-200"
                  />
                </div>

                <div className="space-y-1.5 lg:space-y-3">
                  <label className="text-sm font-medium text-card-foreground">{t("notes.messageLabel")}</label>
                  <textarea
                    placeholder="Type your message here."
                    defaultValue={data.afterPartyNote.message}
                    className="min-h-28 w-full resize-none rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-700 outline-none placeholder:text-zinc-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  />
                  <p className="text-xs text-zinc-400">{t("notes.messageHint")}</p>
                </div>

                <div className="flex justify-end pt-1">
                  <Button className="rounded-xl px-6">{t("common.save")}</Button>
                </div>
              </div>
            </div>
          </WorkspaceCard>
        </div>

        {/* ── Step 2 pill (mobile only) — below form, above table ── */}
        <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-400 lg:hidden">
          <UsersRound className="h-4 w-4 shrink-0" />
          <span>{t("notes.stepTwo")}</span>
        </div>

        {/* ── Recipients table: column 2 ── */}
        <div className="min-w-0 -mx-4 sm:-mx-6 lg:mx-0">
          <AfterPartyRecipientsTable
            title={t("notes.recipientTitle")}
            subtitle={t("notes.recipientSubtitle")}
            searchPlaceholder={t("common.searchGuests")}
            nameLabel={t("guests.table.name")}
            categoryLabel={t("guests.table.category")}
            actionsLabel={t("guests.table.actions")}
            deliveredLabel={t("guests.table.delivered")}
            selectionLabel={t("common.selectedRows", { count: 0, total: data.guests.length })}
            rowsPerPageLabel={t("common.rowsPerPage")}
            pageLabel={t("common.pageLabel", { current: 1, total: 1 })}
            guests={data.guests}
          />
        </div>
      </div>
    </div>
  )
}
