import { BookOpen, Copy, PencilLine, WandSparkles } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { DonutChart } from "@/components/dashboard/invitation/DonutChart"
import { InvitationPhonePreview } from "@/components/dashboard/invitation/InvitationPhonePreview"
import { WorkspaceCard } from "@/components/dashboard/invitation/WorkspaceCard"
import { getInvitationWorkspaceData } from "@/lib/mocks/invitation-workspace"

type Props = {
  readonly params: Promise<{ locale: string; invitationId: string }>
}

const INDIGO_DEEP = "#1F1B74"

export default async function InvitationDashboardPage({ params }: Props) {
  const { locale, invitationId } = await params
  const t = await getTranslations("dashboard.workspace")
  const data = getInvitationWorkspaceData(invitationId, locale)

  const basePath = `/dashboard/my-invitation/${invitationId}`

  return (
    <div className="space-y-6">
      <div className="grid gap-8 xl:gap-20 xl:grid-cols-[300px_minmax(0,1fr)]">

        {/* ── Left: Phone Preview ── */}
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

        {/* ── Right: Content ── */}
        <div className="space-y-6 xl:space-y-8">

          {/* Title + Date */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {/* Title hidden on mobile — shown in the top bar instead */}
              <h2 className="hidden text-4xl font-bold tracking-tight text-zinc-900 lg:block">
                {data.title}
              </h2>
              <p className="text-center text-lg font-medium text-zinc-500 lg:mt-10 lg:text-left lg:text-lg lg:font-normal lg:text-zinc-400">
                {data.eventDateLabel}
              </p>
            </div>
            {/* Edit icon — desktop only */}
            <Button asChild variant="ghost" size="icon" className="hidden h-9 w-9 shrink-0 rounded-full text-zinc-400 hover:text-zinc-600 lg:flex">
              <Link href={`${basePath}/edit`} aria-label={t("overview.editTemplate")}>
                <PencilLine className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Countdown */}
          <WorkspaceCard className="border-0 shadow-none xl:border xl:shadow-sm p-4 sm:p-5">
            <div className="grid grid-cols-4 divide-x divide-zinc-100">
              {[
                { key: "days",    value: data.countdown.days },
                { key: "hours",   value: data.countdown.hours },
                { key: "minutes", value: data.countdown.minutes },
                { key: "seconds", value: data.countdown.seconds },
              ].map((item) => (
                <div key={item.key} className="flex flex-col items-center py-3 text-center sm:py-4">
                  <p className="text-3xl font-semibold leading-none sm:text-5xl" style={{ color: INDIGO_DEEP }}>
                    {item.value}
                  </p>
                  <p className="mt-1.5 text-xs font-normal sm:mt-2 sm:text-sm" style={{ color: "#0A0A0A" }}>
                    {t(`overview.countdownUnits.${item.key}`)}
                  </p>
                </div>
              ))}
            </div>
          </WorkspaceCard>

          {/* Guest Stats */}
          <div className="space-y-5 xl:space-y-2">
            <h3 className="text-center text-lg font-medium text-zinc-500 lg:text-left lg:text-xl">
              {t("overview.guestStatsTitle")}
            </h3>

            <WorkspaceCard className="border-0 shadow-none p-0 xl:border xl:shadow-sm xl:p-5">
              <div className="flex flex-col items-center gap-5 xl:flex-row xl:items-center">
                {/* Donut */}
                <div className="shrink-0">
                  <DonutChart
                    sizeClassName="h-52 w-52 xl:h-48 xl:w-48"
                    segments={[
                      { value: data.stats.attending, color: "#4338CA" },
                      { value: data.stats.declined,  color: "#818CF8" },
                      { value: data.stats.pending,   color: "#C7D2FE" },
                    ]}
                  />
                </div>

                {/* Stats + RSVP */}
                <div className="flex w-full flex-1 flex-col gap-4 sm:gap-5">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {[
                      { value: data.stats.attending, label: t("common.attending"),  color: "#4338CA" },
                      { value: data.stats.declined,  label: t("common.declined"),   color: "#818CF8" },
                      { value: data.stats.pending,   label: t("common.pending"),    color: "#C7D2FE" },
                    ].map(({ value, label, color }) => (
                      <div key={label} className="flex flex-col items-center text-center">
                        <p className="text-2xl font-semibold leading-none sm:text-4xl" style={{ color: INDIGO_DEEP }}>
                          {value}
                        </p>
                        <div className="my-1.5 h-0.5 w-8 rounded-full sm:my-2 sm:w-10" style={{ background: color }} />
                        <p className="text-xs font-normal sm:text-sm" style={{ color: "#0A0A0A" }}>{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* RSVP */}
                  <Button asChild className="h-12 w-full justify-start rounded-xl gap-3 text-sm font-semibold sm:text-base">
                    <Link href={`${basePath}/rsvp`}>
                      <BookOpen className="h-5 w-5" />
                      {t("sidebar.rsvp")}
                    </Link>
                  </Button>
                </div>
              </div>
            </WorkspaceCard>
          </div>

          {/* Invitation Link */}
          <div className="space-y-3">
            {/* Desktop: title + buttons inline */}
            <div className="hidden xl:flex xl:items-center xl:justify-between xl:gap-2">
              <h3 className="text-xl font-medium text-zinc-500">
                {t("overview.invitationLink")}
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl border-zinc-200 px-4 text-sm">
                  <PencilLine className="h-3.5 w-3.5" />
                  {t("common.editLink")}
                </Button>
                <Button size="sm" className="h-9 gap-1.5 rounded-xl px-4 text-sm">
                  <Copy className="h-3.5 w-3.5" />
                  {t("common.copy")}
                </Button>
              </div>
            </div>

            {/* Mobile: title centered */}
            <h3 className="text-center text-lg font-medium text-zinc-500 xl:hidden">
              {t("overview.invitationLink")}
            </h3>

            {/* URL bar */}
            <WorkspaceCard className="border-0 shadow-none p-0 xl:border xl:shadow-sm xl:p-2">
              <div className="flex overflow-hidden rounded-xl border border-zinc-200 shadow-sm xl:shadow-none">
                <span className="flex shrink-0 items-center border-r border-zinc-200 bg-zinc-50 px-2 py-3 text-xs text-zinc-400 sm:px-3 sm:text-sm">
                  {data.invitationLink.prefix}
                </span>
                <span className="flex min-w-0 flex-1 items-center truncate px-2 py-3 text-xs text-zinc-700 sm:px-3 sm:text-sm">
                  {data.invitationLink.slug}
                </span>
                <span className="flex shrink-0 items-center border-l border-zinc-200 bg-zinc-50 px-2 py-3 text-xs text-zinc-400 sm:px-3 sm:text-sm">
                  {data.invitationLink.suffix}
                </span>
              </div>
            </WorkspaceCard>

            {/* Mobile: buttons below URL bar */}
            <div className="grid grid-cols-2 gap-3 xl:hidden">
              <Button variant="outline" className="h-12 gap-2 rounded-xl border-zinc-200">
                <PencilLine className="h-4 w-4" />
                {t("common.editLink")}
              </Button>
              <Button className="h-12 gap-2 rounded-xl">
                <Copy className="h-4 w-4" />
                {t("common.copy")}
              </Button>
            </div>
          </div>

          {/* Message Template */}
          <div className="space-y-3">
            {/* Title: centered on mobile, left on desktop */}
            <h3 className="text-center text-lg font-medium text-zinc-500 xl:text-left xl:text-xl">
              {t("overview.messageTemplateTitle")}
            </h3>

            <textarea
              placeholder={data.messageTemplate}
              className="min-h-32 w-full resize-none rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-700 shadow-sm outline-none placeholder:text-zinc-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 sm:min-h-40 sm:px-4 sm:py-3"
            />

            {/* Mobile: Generate (filled, flex-1) + Simpan (outline) */}
            <div className="mt-3 flex items-center gap-2 xl:hidden">
              <Button className="h-11 flex-1 gap-2 rounded-xl text-sm font-semibold">
                <WandSparkles className="h-4 w-4" />
                {t("overview.generateText")}
              </Button>
              <Button variant="outline" className="h-11 rounded-xl border-zinc-200 px-5 text-sm">
                {t("common.save")}
              </Button>
            </div>

            {/* Desktop: Generate (outline) + Simpan (filled), right-aligned */}
            <div className="mt-3 hidden items-center justify-end gap-2 xl:flex">
              <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl border-zinc-200 px-4 text-sm">
                <WandSparkles className="h-3.5 w-3.5" />
                {t("overview.generateText")}
              </Button>
              <Button size="sm" className="h-9 rounded-xl px-4 text-sm">
                {t("common.save")}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
