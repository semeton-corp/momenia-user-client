import { getTranslations } from "next-intl/server"
import { InvitationWorkspaceHeader } from "@/components/dashboard/invitation/InvitationWorkspaceHeader"
import { RsvpWorkspaceClient } from "@/components/dashboard/invitation/RsvpWorkspaceClient"

type Props = {
  readonly params: Promise<{ locale: string; invitationId: string }>
}

export default async function RsvpPage({ params }: Props) {
  const { invitationId } = await params
  const t = await getTranslations("dashboard.workspace")

  return (
    <div className="space-y-6 xl:space-y-8 xl:pl-8 xl:pt-6">

      {/* Header — hidden on mobile */}
      <div className="hidden xl:block xl:pb-2">
        <InvitationWorkspaceHeader title={t("rsvp.title")} invitationId={invitationId} />
      </div>

      <RsvpWorkspaceClient invitationId={invitationId} />

    </div>
  )
}
