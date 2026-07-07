import InvitationEditorClient from "@/components/editor/InvitationEditorClient"

type Props = {
  params: Promise<{ locale: string; invitationId: string }>
}

export default async function EditInvitationPage({ params }: Props) {
  const { invitationId } = await params
  return <InvitationEditorClient invitationId={invitationId} />
}
