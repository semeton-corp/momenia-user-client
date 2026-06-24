import { getTranslations } from "next-intl/server"
import { GuestsManagementTable } from "@/components/dashboard/invitation/GuestsManagementTable"
import { GuestAddForm } from "@/components/dashboard/invitation/GuestAddForm"
import { InvitationWorkspaceHeader } from "@/components/dashboard/invitation/InvitationWorkspaceHeader"
import { getInvitationWorkspaceData } from "@/lib/mocks/invitation-workspace"

type Props = {
  readonly params: Promise<{ locale: string; invitationId: string }>
}

export default async function GuestsPage({ params }: Props) {
  const { locale, invitationId } = await params
  const t = await getTranslations("dashboard.workspace")
  const data = getInvitationWorkspaceData(invitationId, locale)

  return (
    <div className="space-y-6 xl:space-y-10 xl:pl-8 xl:pt-6">
      <div className="hidden xl:block">
        <InvitationWorkspaceHeader title={t("guests.title")} subtitle={data.title} />
      </div>

      <div className="grid gap-6 xl:gap-9 xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* Form: first on mobile, right column on desktop */}
        <div className="min-w-0 -mx-4 sm:-mx-6 xl:mx-0 xl:order-last">
          <GuestAddForm
            title={t("guests.addTitle")}
            nameLabel={t("guests.form.name")}
            whatsAppLabel={t("guests.form.whatsApp")}
            emailLabel={t("guests.form.email")}
            categoryLabel={t("guests.form.category")}
            chooseCategoryLabel={t("guests.form.chooseCategory")}
            categoryHint={t("guests.form.categoryHint")}
            vipLabel={t("common.vip")}
            regularLabel={t("common.regular")}
            saveLabel={t("common.save")}
            cancelLabel={t("common.cancel")}
          />
        </div>

        {/* Table: second on mobile, left column on desktop */}
        <div className="min-w-0 -mx-4 sm:-mx-6 xl:mx-0 xl:order-first">
          <GuestsManagementTable
            title={t("guests.listTitle")}
            searchPlaceholder={t("common.searchGuests")}
            totalLabel={t("guests.totalGuests", { count: data.guests.length })}
            sortLabel={t("common.sort")}
            deleteLabel={t("guests.deleteRows")}
            nameLabel={t("guests.table.name")}
            whatsAppLabel={t("guests.table.whatsApp")}
            emailLabel={t("guests.table.email")}
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
