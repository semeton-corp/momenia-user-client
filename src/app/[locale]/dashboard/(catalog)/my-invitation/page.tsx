import { ArrowRight } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { WorkspaceCard } from "@/components/dashboard/invitation/WorkspaceCard"
import { DEMO_INVITATION_ID, getInvitationWorkspaceData } from "@/lib/mocks/invitation-workspace"

type Props = {
  params: Promise<{ locale: string }>
}

// test
export default async function MyInvitationPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations("dashboard.workspace")
  const data = getInvitationWorkspaceData(DEMO_INVITATION_ID, locale)

  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-6 p-5 md:p-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold text-zinc-950">{t("launcher.title")}</h1>
        <p className="text-base text-zinc-500">{t("launcher.subtitle")}</p>
      </div>

      <WorkspaceCard className="grid gap-5 p-6 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-600">
            {t("launcher.demoBadge")}
          </p>
          <h2 className="text-3xl font-semibold text-zinc-950">{data.title}</h2>
          <p className="text-sm leading-7 text-zinc-600">{t("launcher.helper")}</p>
        </div>

        <Button asChild className="h-12 rounded-xl text-sm font-semibold">
          <Link href={`/dashboard/my-invitation/${DEMO_INVITATION_ID}`}>
            {t("launcher.openDemo")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </WorkspaceCard>
    </div>
  )
}
