"use client"

import { BookOpenCheck, Copy, PencilLine, WandSparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { DonutChart } from "@/components/dashboard/invitation/DonutChart"
import { InvitationPhonePreview } from "@/components/dashboard/invitation/InvitationPhonePreview"
import { WorkspaceCard } from "@/components/dashboard/invitation/WorkspaceCard"
import { typography } from "@/lib/typography"
import { useUserInvitationDashboard } from "@/hooks/useUserInvitations"
import { getInvitationWorkspaceData } from "@/lib/mocks/invitation-workspace"

const INDIGO_DEEP = "#1F1B74"

function computeCountdown(eventDate: string) {
  const now = new Date()
  const target = new Date(eventDate)
  const diff = Math.max(0, target.getTime() - now.getTime())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds }
}

type Props = {
  invitationId: string
  locale: string
}

export function InvitationDashboardClient({ invitationId, locale }: Props) {
  const t = useTranslations("dashboard.workspace")
  const { data, isLoading } = useUserInvitationDashboard(invitationId)

  const basePath = `/dashboard/my-invitation/${invitationId}`

  // Fall back to mock while loading or if API returns nothing useful
  const mock = getInvitationWorkspaceData(invitationId, locale)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-400">
        Loading...
      </div>
    )
  }

  const title = data?.name || mock.title
  const eventDate = data?.eventDate || ""
  const countdown = eventDate ? computeCountdown(eventDate) : mock.countdown
  const planName = data?.planName || mock.planName
  const activeUntilLabel = data?.activeUntil
    ? new Date(data.activeUntil).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", { day: "numeric", month: "long", year: "numeric" })
    : mock.activeUntilLabel
  const previewImage = data?.invitationTemplateThumbnail || mock.previewImage
  const attending = data?.attendingCount ?? mock.stats.attending
  const declined = data?.declinedCount ?? mock.stats.declined
  const pending = data?.pendingCount ?? mock.stats.pending
  const pathUrl = data?.pathUrl || mock.invitationLink.slug
  const messageTemplate = data?.messageTemplate || mock.messageTemplate
  const eventDateLabel = eventDate
    ? new Date(eventDate).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : mock.eventDateLabel

  return (
    <div className="space-y-6">
      <div className="grid gap-8 xl:gap-32 xl:grid-cols-[420px_minmax(0,1fr)] mt-16">

        {/* ── Left: Phone Preview ── */}
        <div className="ml-6">
          <InvitationPhonePreview
            imageUrl={previewImage}
            title={title}
            planName={planName}
            activeUntilLabel={activeUntilLabel}
            publishLabel={t("overview.publishNow")}
            editLabel={t("overview.editTemplate")}
            guestsLabel={t("overview.manageGuests")}
            editHref={`${basePath}/edit`}
            guestsHref={`${basePath}/guests`}
          />
        </div>

        {/* ── Right: Content ── */}
        <div className="flex flex-col gap-3 xl:gap-0">

          {/* Title + Date */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h2 className={`hidden ${typography["5xl"].semibold} text-zinc-900 lg:block`}>
                {title}
              </h2>
              <p className={`text-center ${typography["2xl"].regular} lg:text-left xl:mt-16`} style={{ color: "var(--semantic-border)" }}>
                {eventDateLabel}
              </p>
            </div>
            <Button asChild variant="ghost" size="icon" className="hidden h-9 w-9 shrink-0 rounded-full text-zinc-400 hover:text-zinc-600 lg:flex">
              <Link href={`${basePath}/edit`} aria-label={t("overview.editTemplate")}>
                <PencilLine className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Countdown */}
          <WorkspaceCard className="border-0 shadow-none xl:border xl:shadow-sm p-4 sm:p-5 xl:p-0 xl:mt-8">
            <div className="grid grid-cols-4 xl:h-[136px]">
              {[
                { key: "days",    value: countdown.days },
                { key: "hours",   value: countdown.hours },
                { key: "minutes", value: countdown.minutes },
                { key: "seconds", value: countdown.seconds },
              ].map((item) => (
                <div key={item.key} className="flex flex-col items-center justify-center py-3 text-center sm:py-4 xl:py-0">
                  <p className={typography["5xl"].medium} style={{ color: "var(--indigo-deep)" }}>
                    {item.value}
                  </p>
                  <p className={`mt-1.5 ${typography.xl.regular} sm:mt-2`} style={{ color: "var(--foreground)" }}>
                    {t(`overview.countdownUnits.${item.key}`)}
                  </p>
                </div>
              ))}
            </div>
          </WorkspaceCard>

          {/* Guest Stats */}
          <div className="space-y-5 xl:space-y-8 xl:mt-8">
            <h3 className={`text-center ${typography["2xl"].regular} lg:text-left`} style={{ color: "var(--semantic-border)" }}>
              {t("overview.guestStatsTitle")}
            </h3>

            <WorkspaceCard className="border-0 shadow-none p-0 xl:border xl:shadow-sm xl:p-5 xl:h-[263px] w-full">
              <div className="flex flex-col items-center gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="shrink-0">
                  <DonutChart
                    sizeClassName="h-52 w-52 xl:h-[215px] xl:w-[215px]"
                    segments={[
                      { value: attending, color: "#4338CA" },
                      { value: declined,  color: "#818CF8" },
                      { value: pending,   color: "#C7D2FE" },
                    ]}
                  />
                </div>

                <div className="flex w-full flex-1 flex-col gap-4 sm:gap-5">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {[
                      { value: attending, label: t("common.attending"),  color: "#4338CA" },
                      { value: declined,  label: t("common.declined"),   color: "#818CF8" },
                      { value: pending,   label: t("common.pending"),    color: "#C7D2FE" },
                    ].map(({ value, label, color }) => (
                      <div key={label} className="flex flex-col items-center text-center">
                        <p className={`text-2xl font-semibold leading-none sm:text-4xl xl:${typography["4xl"].medium}`} style={{ color: INDIGO_DEEP }}>
                          {value}
                        </p>
                        <div className="my-1.5 h-0.5 w-8 rounded-full sm:my-2 sm:w-10 xl:my-3 xl:h-1 xl:w-12" style={{ background: color }} />
                        <p className="text-xs font-normal sm:text-sm xl:text-xl xl:font-normal" style={{ color: "#0A0A0A" }}>{label}</p>
                      </div>
                    ))}
                  </div>

                  <Button asChild className="h-12 w-full justify-start rounded-xl gap-3 p-4 text-sm font-semibold sm:text-base xl:h-16 xl:p-4 xl:text-xl xl:font-semibold">
                    <Link href={`${basePath}/rsvp`}>
                      <BookOpenCheck className="h-5 w-5 xl:h-8 xl:w-8" />
                      {t("sidebar.rsvp")}
                    </Link>
                  </Button>
                </div>
              </div>
            </WorkspaceCard>
          </div>

          {/* Invitation Link */}
          <div className="space-y-3 xl:mt-8">
            <div className="hidden xl:flex xl:items-center xl:justify-between xl:gap-2">
              <h3 className={typography["2xl"].regular} style={{ color: "var(--semantic-border)" }}>
                {t("overview.invitationLink")}
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 w-[118px] gap-1.5 rounded-md border border-zinc-200 px-3 text-sm font-medium" style={{ background: "var(--accent)" }}>
                  <PencilLine className="h-3.5 w-3.5" />
                  {t("common.editLink")}
                </Button>
                <Button size="sm" className="h-8 w-[96px] gap-1.5 rounded-md px-3 text-sm font-medium">
                  <Copy className="h-3.5 w-3.5" />
                  {t("common.copy")}
                </Button>
              </div>
            </div>

            <h3 className={`text-center ${typography["2xl"].regular} xl:hidden`} style={{ color: "var(--semantic-border)" }}>
              {t("overview.invitationLink")}
            </h3>

            <div className="flex overflow-hidden rounded-xl border border-zinc-200 shadow-sm xl:h-[60px] xl:items-center xl:rounded-lg xl:px-3 xl:gap-3">
              <span className="flex shrink-0 items-center border-r border-zinc-200 bg-zinc-50 px-2 py-3 text-xs text-zinc-400 sm:px-3 sm:text-sm xl:h-[44px] xl:w-[196px] xl:justify-center xl:rounded-[4px] xl:border xl:border-zinc-200 xl:bg-zinc-50 xl:text-base xl:font-normal xl:px-3">
                momenia.com/
              </span>
              <span className="flex min-w-0 flex-1 items-center truncate px-2 py-3 text-xs text-zinc-700 sm:px-3 sm:text-sm xl:text-base xl:font-normal xl:px-2">
                {pathUrl}
              </span>
              <span className="flex shrink-0 items-center border-l border-zinc-200 bg-zinc-50 px-2 py-3 text-xs text-zinc-400 sm:px-3 sm:text-sm xl:h-[44px] xl:w-[61px] xl:justify-center xl:rounded-lg xl:border xl:border-zinc-200 xl:bg-zinc-50 xl:text-base xl:font-normal xl:border-l-0">
                .id
              </span>
            </div>

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
          <div className="space-y-3 xl:mt-8">
            <h3 className={`text-center ${typography["2xl"].regular} xl:text-left`} style={{ color: "var(--semantic-border)" }}>
              {t("overview.messageTemplateTitle")}
            </h3>

            <textarea
              placeholder={messageTemplate}
              className="min-h-32 w-full resize-none rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-700 shadow-sm outline-none placeholder:text-zinc-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 sm:min-h-40 sm:px-4 sm:py-3"
            />

            <div className="mt-3 flex items-center gap-2 xl:hidden">
              <Button className="h-11 flex-1 gap-2 rounded-xl text-sm font-semibold">
                <WandSparkles className="h-4 w-4" />
                {t("overview.generateText")}
              </Button>
              <Button variant="outline" className="h-11 rounded-xl border-zinc-200 px-5 text-sm">
                {t("common.save")}
              </Button>
            </div>

            <div className="mt-3 hidden items-center justify-end gap-2 xl:flex">
              <Button size="sm" className="h-9 w-[217px] gap-1.5 rounded-md text-sm font-medium" style={{ background: "var(--primary)" }}>
                <WandSparkles className="h-3.5 w-3.5" />
                {t("overview.generateText")}
              </Button>
              <Button size="sm" className="h-9 rounded-md px-4 text-sm font-medium" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                {t("common.save")}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
