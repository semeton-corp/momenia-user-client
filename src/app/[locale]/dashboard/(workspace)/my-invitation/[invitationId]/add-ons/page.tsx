import { getTranslations } from "next-intl/server"
import { AddOnCard } from "@/components/dashboard/invitation/AddOnCard"
import { InvitationWorkspaceHeader } from "@/components/dashboard/invitation/InvitationWorkspaceHeader"
import { getInvitationWorkspaceData } from "@/lib/mocks/invitation-workspace"

type Props = {
  params: Promise<{ locale: string; invitationId: string }>
}

export default async function AddOnsPage({ params }: Props) {
  const { locale, invitationId } = await params
  const t = await getTranslations("dashboard.workspace")
  const data = getInvitationWorkspaceData(invitationId, locale)

  return (
    <div className="space-y-6">
      <InvitationWorkspaceHeader title={t("addOns.title")} subtitle={data.title} />

      <div className="grid gap-5 xl:grid-cols-3">
        {data.addOns.map((addOn) => (
          <AddOnCard
            key={addOn.id}
            addOn={addOn}
            activeLabel={t("addOns.active")}
            lockedLabel={t("addOns.locked")}
          />
        ))}
      </div>
    </div>
  )
}
