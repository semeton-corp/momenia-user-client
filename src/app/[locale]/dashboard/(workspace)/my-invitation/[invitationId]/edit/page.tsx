import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InvitationPhonePreview } from "@/components/dashboard/invitation/InvitationPhonePreview"
import { InvitationWorkspaceHeader } from "@/components/dashboard/invitation/InvitationWorkspaceHeader"
import { WorkspaceCard } from "@/components/dashboard/invitation/WorkspaceCard"
import { getInvitationWorkspaceData } from "@/lib/mocks/invitation-workspace"

type Props = {
  params: Promise<{ locale: string; invitationId: string }>
}

export default async function EditInvitationPage({ params }: Props) {
  const { locale, invitationId } = await params
  const t = await getTranslations("dashboard.workspace")
  const data = getInvitationWorkspaceData(invitationId, locale)
  const basePath = `/dashboard/my-invitation/${invitationId}`

  return (
    <div className="space-y-6">
      <InvitationWorkspaceHeader title={t("edit.title")} subtitle={t("edit.subtitle")} />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <InvitationPhonePreview
          imageUrl={data.previewImage}
          title={data.title}
          planName={data.planName}
          activeUntilLabel={data.activeUntilLabel}
          publishLabel={t("overview.publishNow")}
          editLabel={t("overview.editTemplate")}
          guestsLabel={t("overview.manageGuests")}
          editHref={`${basePath}/edit`}
          guestsHref={`${basePath}/guests`}
        />

        <div className="space-y-6">
          <WorkspaceCard className="p-5">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-zinc-950">{t("edit.settingsTitle")}</h2>
              <p className="text-sm text-zinc-500">{t("edit.settingsDescription")}</p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">{t("edit.hostLabel")}</label>
                <Input defaultValue="Romeo & Juliet Wedding" className="h-12 border-zinc-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">{t("edit.slugLabel")}</label>
                <Input defaultValue={data.invitationLink.slug} className="h-12 border-zinc-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">{t("edit.themeLabel")}</label>
                <Input defaultValue="Classic Romance" className="h-12 border-zinc-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">{t("edit.colorLabel")}</label>
                <Input defaultValue="Indigo Bloom" className="h-12 border-zinc-200" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" className="rounded-xl px-5">
                {t("common.cancel")}
              </Button>
              <Button className="rounded-xl px-5">{t("common.save")}</Button>
            </div>
          </WorkspaceCard>

          <WorkspaceCard className="p-5">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-zinc-950">{t("edit.previewTitle")}</h2>
              <p className="text-sm leading-7 text-zinc-600">{t("edit.previewDescription")}</p>
            </div>
          </WorkspaceCard>
        </div>
      </div>
    </div>
  )
}
