import { BookOpenCheck, Copy, PencilLine, WandSparkles } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { DonutChart } from "@/components/dashboard/invitation/DonutChart"
import { InvitationPhonePreview } from "@/components/dashboard/invitation/InvitationPhonePreview"
import { WorkspaceCard } from "@/components/dashboard/invitation/WorkspaceCard"
import { getInvitationWorkspaceData } from "@/lib/mocks/invitation-workspace"
import { typography } from "@/lib/typography"

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
      <div className="grid gap-8 xl:gap-32 xl:grid-cols-[420px_minmax(0,1fr)] mt-16">

        {/* ── Left: Phone Preview ── */}
        <div className="ml-6">
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
        </div>

        {/* ── Right: Content ── */}
        <div className="flex flex-col gap-3 xl:gap-0">

          {/* Title + Date */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {/* Title hidden on mobile — shown in the top bar instead */}
              <h2 className={`hidden ${typography["5xl"].semibold} text-zinc-900 lg:block`}>
                {data.title}
              </h2>
              <p className={`text-center ${typography["2xl"].regular} lg:text-left xl:mt-16`} style={{ color: "var(--semantic-border)" }}>
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

          {/* Countdown — mt-8 = 32px dari date */}
          <WorkspaceCard className="border-0 shadow-none xl:border xl:shadow-sm p-4 sm:p-5 xl:p-0 xl:mt-8">
            <div className="grid grid-cols-4 xl:h-[136px]">
              {[
                { key: "days",    value: data.countdown.days },
                { key: "hours",   value: data.countdown.hours },
                { key: "minutes", value: data.countdown.minutes },
                { key: "seconds", value: data.countdown.seconds },
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

          {/* Guest Stats — mt-8 = 32px dari countdown */}
          <div className="space-y-5 xl:space-y-8 xl:mt-8">
            <h3 className={`text-center ${typography["2xl"].regular} lg:text-left`} style={{ color: "var(--semantic-border)" }}>
              {t("overview.guestStatsTitle")}
            </h3>

            <WorkspaceCard className="border-0 shadow-none p-0 xl:border xl:shadow-sm xl:p-5 xl:h-[263px] w-full">
              <div className="flex flex-col items-center gap-5 xl:flex-row xl:items-center xl:justify-between">
                {/* Donut */}
                <div className="shrink-0">
                  <DonutChart
                    sizeClassName="h-52 w-52 xl:h-[215px] xl:w-[215px]"
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
                        <p className={`text-2xl font-semibold leading-none sm:text-4xl xl:${typography["4xl"].medium}`} style={{ color: INDIGO_DEEP }}>
                          {value}
                        </p>
                        <div className="my-1.5 h-0.5 w-8 rounded-full sm:my-2 sm:w-10 xl:my-3 xl:h-1 xl:w-12" style={{ background: color }} />
                        <p className="text-xs font-normal sm:text-sm xl:text-xl xl:font-normal" style={{ color: "#0A0A0A" }}>{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* RSVP */}
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

          {/* Invitation Link — mt-8 = 32px dari guest stats container */}
          <div className="space-y-3 xl:mt-8">
            {/* Desktop: title + buttons inline */}
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

            {/* Mobile: title centered */}
            <h3 className={`text-center ${typography["2xl"].regular} xl:hidden`} style={{ color: "var(--semantic-border)" }}>
              {t("overview.invitationLink")}
            </h3>

            {/* URL bar */}
            <div className="flex overflow-hidden rounded-xl border border-zinc-200 shadow-sm xl:h-[60px] xl:items-center xl:rounded-lg xl:px-3 xl:gap-3">
              {/* Prefix */}
              <span className="flex shrink-0 items-center border-r border-zinc-200 bg-zinc-50 px-2 py-3 text-xs text-zinc-400 sm:px-3 sm:text-sm xl:h-[44px] xl:w-[196px] xl:justify-center xl:rounded-[4px] xl:border xl:border-zinc-200 xl:bg-zinc-50 xl:text-base xl:font-normal xl:px-3">
                {data.invitationLink.prefix}
              </span>
              {/* Slug */}
              <span className="flex min-w-0 flex-1 items-center truncate px-2 py-3 text-xs text-zinc-700 sm:px-3 sm:text-sm xl:text-base xl:font-normal xl:px-2">
                {data.invitationLink.slug}
              </span>
              {/* Suffix */}
              <span className="flex shrink-0 items-center border-l border-zinc-200 bg-zinc-50 px-2 py-3 text-xs text-zinc-400 sm:px-3 sm:text-sm xl:h-[44px] xl:w-[61px] xl:justify-center xl:rounded-lg xl:border xl:border-zinc-200 xl:bg-zinc-50 xl:text-base xl:font-normal xl:border-l-0">
                {data.invitationLink.suffix}
              </span>
            </div>

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

          {/* Message Template — mt-8 = 32px dari invitation link container */}
          <div className="space-y-3 xl:mt-8">
            {/* Title: centered on mobile, left on desktop */}
            <h3 className={`text-center ${typography["2xl"].regular} xl:text-left`} style={{ color: "var(--semantic-border)" }}>
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

            {/* Desktop: Generate + Simpan, right-aligned */}
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
