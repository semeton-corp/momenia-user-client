import { InvitationDashboardClient } from "@/components/dashboard/invitation/InvitationDashboardClient"

type Props = {
  readonly params: Promise<{ locale: string; invitationId: string }>
}

export default async function InvitationDashboardPage({ params }: Props) {
  const { locale, invitationId } = await params

  return <InvitationDashboardClient invitationId={invitationId} locale={locale} />
}
