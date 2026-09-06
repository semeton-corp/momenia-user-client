import { getTranslations } from "next-intl/server"
import { InvitationWorkspaceHeader } from "@/components/dashboard/invitation/InvitationWorkspaceHeader"
import { MessagesWorkspaceClient } from "@/components/dashboard/invitation/MessagesWorkspaceClient"

type Props = {
  readonly params: Promise<{ locale: string; invitationId: string }>
}

export default async function MessagesPage({ params }: Props) {
  const { invitationId } = await params
  const t = await getTranslations("dashboard.workspace")

  return (
    <div className="space-y-6 xl:pl-8 xl:pt-6">
      <div className="hidden xl:block xl:pb-4">
        <InvitationWorkspaceHeader title={t("messages.title")} invitationId={invitationId} />
      </div>

      <MessagesWorkspaceClient invitationId={invitationId} />
    </div>
  )
}
