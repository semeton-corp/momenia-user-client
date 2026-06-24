import { getTranslations } from "next-intl/server"
import { Input } from "@/components/ui/input"
import { GuestMessageCard } from "@/components/dashboard/invitation/GuestMessageCard"
import { InvitationWorkspaceHeader } from "@/components/dashboard/invitation/InvitationWorkspaceHeader"
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

      <Input
        aria-label={t("messages.searchPlaceholder")}
        placeholder={t("messages.searchPlaceholder")}
        className="h-12 border-zinc-200"
      />

      <div className="xl:columns-2 xl:gap-4 space-y-4 xl:space-y-0">
        {data.messages.map((message) => (
          <div key={message.id} className="break-inside-avoid mb-4">
            <GuestMessageCard
              message={message}
              voiceLabel={t("messages.voiceNote", { name: message.senderName })}
              hideLabel={t("common.hide")}
              deleteLabel={t("common.delete")}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
