import { InvitationDashboardClient } from "@/components/dashboard/invitation/InvitationDashboardClient"

type Props = {
  readonly params: Promise<{ locale: string; invitationId: string }>
  readonly searchParams: Promise<{ templateId?: string | string[]; templateName?: string | string[] }>
}

export default async function InvitationDashboardPage({ params, searchParams }: Props) {
  const [{ locale, invitationId }, query] = await Promise.all([params, searchParams])
  const templateIdFromUrl = typeof query.templateId === "string" ? query.templateId : undefined
  const templateNameFromUrl = typeof query.templateName === "string" ? query.templateName : undefined

  return (
    <InvitationDashboardClient
      invitationId={invitationId}
      locale={locale}
      templateIdFromUrl={templateIdFromUrl}
      templateNameFromUrl={templateNameFromUrl}
    />
  )
}
