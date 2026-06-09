import type { ReactNode } from "react"
import { House } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { InvitationWorkspaceSidebar } from "@/components/dashboard/invitation/InvitationWorkspaceSidebar"
import { ZoomWrapper } from "@/components/dashboard/invitation/ZoomWrapper"
import { getInvitationWorkspaceData } from "@/lib/mocks/invitation-workspace"

type Props = {
  readonly children: ReactNode
  readonly params: Promise<{ locale: string; invitationId: string }>
}

export default async function InvitationWorkspaceLayout({ children, params }: Props) {
  const { locale, invitationId } = await params
  const data = getInvitationWorkspaceData(invitationId, locale)

  return (
    <ZoomWrapper>
    <div className="min-h-screen bg-white">
      <InvitationWorkspaceSidebar invitationId={invitationId} />

      {/* Mobile-only top bar */}
      <header
        className="fixed left-0 right-0 top-0 z-40 flex items-center justify-center px-4 lg:hidden"
        style={{ background: "#FAFAFA", borderBottom: "1px solid #E5E5E5", height: "60px" }}
      >
        <Link
          href={`/dashboard/my-invitation/${invitationId}`}
          className="absolute left-4 flex items-center justify-center"
        >
          <House className="h-6 w-6" style={{ color: "#4F46E5" }} />
        </Link>
        <span className="text-base font-semibold text-zinc-800">{data.title}</span>
      </header>

      <main className="min-h-screen pb-24 pt-[60px] lg:pb-0 lg:pl-24 lg:pt-0">
        <div className="px-4 py-5 sm:px-6 lg:pl-8 lg:pr-16 lg:py-6 xl:pl-16 xl:pr-32 xl:py-8">
          {children}
        </div>
      </main>
    </div>
    </ZoomWrapper>
  )
}
