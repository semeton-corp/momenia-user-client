import type { ReactNode } from "react"
import { InvitationWorkspaceSidebar } from "@/components/dashboard/invitation/InvitationWorkspaceSidebar"
import { InvitationWorkspaceTopBar } from "@/components/dashboard/invitation/InvitationWorkspaceTopBar"
import { ZoomWrapper } from "@/components/dashboard/invitation/ZoomWrapper"
import { EditorDirtyProvider } from "@/contexts/EditorDirtyContext"

type Props = {
  readonly children: ReactNode
  readonly params: Promise<{ locale: string; invitationId: string }>
}

export default async function InvitationWorkspaceLayout({ children, params }: Props) {
  const { invitationId } = await params

  return (
    <ZoomWrapper>
    <EditorDirtyProvider>
    <div className="min-h-screen bg-white">
      <InvitationWorkspaceSidebar invitationId={invitationId} />

      <InvitationWorkspaceTopBar invitationId={invitationId} />

      <main className="min-h-screen pb-24 pt-[60px] lg:pb-0 lg:pl-24 lg:pt-0">
        <div className="px-4 py-5 sm:px-6 lg:pl-8 lg:pr-16 lg:py-6 xl:pl-16 xl:pr-48 xl:py-8">
          {children}
        </div>
      </main>
    </div>
    </EditorDirtyProvider>
    </ZoomWrapper>
  )
}
