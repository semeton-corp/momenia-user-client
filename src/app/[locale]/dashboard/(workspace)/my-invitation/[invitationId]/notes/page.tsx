import { getTranslations } from "next-intl/server"
import { InvitationWorkspaceHeader } from "@/components/dashboard/invitation/InvitationWorkspaceHeader"
import { NotesWorkspaceClient } from "@/components/dashboard/invitation/NotesWorkspaceClient"
import { getInvitationWorkspaceData } from "@/lib/mocks/invitation-workspace"

type Props = {
  readonly params: Promise<{ locale: string; invitationId: string }>
}

export default async function NotesPage({ params }: Props) {
  const { locale, invitationId } = await params
  const t = await getTranslations("dashboard.workspace")
  const data = getInvitationWorkspaceData(invitationId, locale)

  return (
    <div className="space-y-4 xl:space-y-10">
      {/* Header — hidden on mobile */}
      <div className="hidden xl:block xl:pl-8 xl:pt-6">
        <InvitationWorkspaceHeader title={t("notes.title")} subtitle={data.title} />
      </div>

      <NotesWorkspaceClient invitationId={invitationId} />
    </div>
  )
}
