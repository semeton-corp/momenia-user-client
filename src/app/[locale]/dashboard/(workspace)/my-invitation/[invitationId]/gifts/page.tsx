import { CreditCard, Gift, MapPin } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InvitationWorkspaceHeader } from "@/components/dashboard/invitation/InvitationWorkspaceHeader"
import { WorkspaceCard } from "@/components/dashboard/invitation/WorkspaceCard"
import { getInvitationWorkspaceData } from "@/lib/mocks/invitation-workspace"

type Props = {
  params: Promise<{ locale: string; invitationId: string }>
}

export default async function GiftsPage({ params }: Props) {
  const { locale, invitationId } = await params
  const t = await getTranslations("dashboard.workspace")
  const data = getInvitationWorkspaceData(invitationId, locale)

  const giftCards = [
    { title: t("gifts.bankTransfer"), icon: CreditCard, value: "BCA 1234567890 a/n Romeo Juliette" },
    { title: t("gifts.digitalWallet"), icon: Gift, value: "OVO / GoPay / Dana" },
    { title: t("gifts.shippingGift"), icon: MapPin, value: "Jl. Sunset Road No. 88, Denpasar" },
  ]

  return (
    <div className="space-y-6">
      <InvitationWorkspaceHeader title={t("gifts.title")} subtitle={data.title} />

      <WorkspaceCard className="p-5">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold text-zinc-950">{t("gifts.summaryTitle")}</h2>
          <p className="text-sm text-zinc-500">{t("gifts.summaryDescription")}</p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {giftCards.map(({ title, icon: Icon, value }) => (
            <div key={title} className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-lg font-semibold text-zinc-900">{title}</p>
              </div>
              <p className="mt-4 text-sm leading-7 text-zinc-600">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">{t("gifts.bankTransfer")}</label>
            <Input defaultValue="BCA 1234567890" className="h-12 border-zinc-200" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">{t("gifts.digitalWallet")}</label>
            <Input defaultValue="0812 3456 7890" className="h-12 border-zinc-200" />
          </div>
        </div>

        <p className="mt-6 text-sm text-zinc-500">{t("gifts.comingSoon")}</p>

        <div className="mt-6 flex justify-end">
          <Button className="rounded-xl px-5">{t("common.save")}</Button>
        </div>
      </WorkspaceCard>
    </div>
  )
}
