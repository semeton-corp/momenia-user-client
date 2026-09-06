import { getTranslations } from "next-intl/server"
import { GuestsWorkspaceClient } from "@/components/dashboard/invitation/GuestsWorkspaceClient"
import { InvitationWorkspaceHeader } from "@/components/dashboard/invitation/InvitationWorkspaceHeader"

type Props = {
  readonly params: Promise<{ locale: string; invitationId: string }>
}

export default async function GuestsPage({ params }: Props) {
  const { invitationId } = await params
  const t = await getTranslations("dashboard.workspace")

  return (
    <div className="space-y-6 xl:space-y-10 xl:pl-8 xl:pt-6">
      <div className="hidden xl:block">
        <InvitationWorkspaceHeader title={t("guests.title")} invitationId={invitationId} />
      </div>

      <GuestsWorkspaceClient invitationId={invitationId} />
    </div>
  )
}
