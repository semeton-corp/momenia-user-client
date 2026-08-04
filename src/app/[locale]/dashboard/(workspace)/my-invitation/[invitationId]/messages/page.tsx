import { getTranslations } from "next-intl/server"
import { InvitationWorkspaceHeader } from "@/components/dashboard/invitation/InvitationWorkspaceHeader"
import { MessagesWorkspaceClient } from "@/components/dashboard/invitation/MessagesWorkspaceClient"
import { getInvitationWorkspaceData } from "@/lib/mocks/invitation-workspace"

type Props = {
  readonly params: Promise<{ locale: string; invitationId: string }>
}

export default async function MessagesPage({ params }: Props) {
  const { locale, invitationId } = await params
  const t = await getTranslations("dashboard.workspace")
  const data = getInvitationWorkspaceData(invitationId, locale)

  return (
    <div className="space-y-6 xl:pl-8 xl:pt-6">
      <div className="hidden xl:block xl:pb-4">
        <InvitationWorkspaceHeader title={t("messages.title")} subtitle={data.title} />
      </div>

      <MessagesWorkspaceClient invitationId={invitationId} />
    </div>
  )
}
