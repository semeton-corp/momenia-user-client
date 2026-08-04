"use client"

import * as React from "react"
import { BookOpenCheck, Check, Copy, Loader2, MessageSquareText, Palette, PencilLine, SquarePen, TableProperties, UserPlus, Users, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link } from "@/i18n/navigation"
import { DonutChart } from "@/components/dashboard/invitation/DonutChart"
import { InvitationDashboardSkeleton } from "@/components/dashboard/invitation/InvitationDashboardSkeleton"
import { InvitationPhonePreview } from "@/components/dashboard/invitation/InvitationPhonePreview"
import { WorkspaceActionCard } from "@/components/dashboard/invitation/WorkspaceActionCard"
import { WorkspaceCard } from "@/components/dashboard/invitation/WorkspaceCard"
import { typography } from "@/lib/typography"
import { cn, parseGoTimestamp } from "@/lib/utils"
import { buildCoverPreviewHtml } from "@/lib/invitation-template/render-cover-preview"
import { useCheckPathUrl, useUpdateUserInvitation, useUserInvitationDetail } from "@/hooks/useUserInvitations"
import { useToast } from "@/providers/ToastProvider"

const INDIGO_DEEP = "#1F1B74"
const SLUG_PATTERN = /^[a-z0-9-]+$/

function computeCountdown(target: Date) {
  const now = new Date()
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
  const { toast } = useToast()

  const { data, isLoading, isError } = useUserInvitationDetail(invitationId)
  const publishMutation = useUpdateUserInvitation(invitationId)
  const linkMutation = useUpdateUserInvitation(invitationId)
  const checkPathUrlMutation = useCheckPathUrl()

  const [isEditingLink, setIsEditingLink] = React.useState(false)
  const [slugDraft, setSlugDraft] = React.useState("")
  const [debouncedSlugDraft, setDebouncedSlugDraft] = React.useState("")
  const [slugAvailability, setSlugAvailability] = React.useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle")
  const [slugError, setSlugError] = React.useState<string | null>(null)
  const [isSavingLink, setIsSavingLink] = React.useState(false)

  const basePath = `/dashboard/my-invitation/${invitationId}`

  // Debounce supaya tidak ngecek availability di setiap ketikan
  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSlugDraft(slugDraft), 400)
    return () => clearTimeout(id)
  }, [slugDraft])

  // Cek availability live selagi user mengetik slug baru (sesuai request backend:
  // "setiap ketik dicek, kalau avail ijo kalau ngga merah").
  React.useEffect(() => {
    if (!isEditingLink) return
    const trimmed = debouncedSlugDraft.trim()
    const currentSlug = data?.slug ?? ""
    if (!trimmed || trimmed === currentSlug) {
      setSlugAvailability("idle")
      return
    }
    if (!SLUG_PATTERN.test(trimmed)) {
      setSlugAvailability("invalid")
      return
    }
    let cancelled = false
    setSlugAvailability("checking")
    checkPathUrlMutation
      .mutateAsync({ slug: trimmed })
      .then((result) => {
        if (!cancelled) setSlugAvailability(result.isAvailable ? "available" : "taken")
      })
      .catch(() => {
        if (!cancelled) setSlugAvailability("idle")
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSlugDraft, isEditingLink, data?.slug])

  if (isLoading) return <InvitationDashboardSkeleton />
  if (isError || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-400">
        {t("overview.loadError")}
      </div>
    )
  }

  const fieldValues = data.fieldValues ?? {}
  const eventDateRaw = fieldValues.event_date
  const eventDateObj = eventDateRaw ? new Date(`${eventDateRaw}T${fieldValues.event_time || "00:00"}`) : null
  const hasValidEventDate = !!eventDateObj && !Number.isNaN(eventDateObj.getTime())
  const countdown = hasValidEventDate ? computeCountdown(eventDateObj!) : { days: 0, hours: 0, minutes: 0, seconds: 0 }
  const eventDateLabel = hasValidEventDate
    ? eventDateObj!.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : ""

  const title = data.name
  const planName = data.invitationDurationPackage
  const isPublished = data.status === "published"
  const slug = data.slug
  const expiredAtDate = parseGoTimestamp(data.expiredAt)
  const activeUntilLabel = expiredAtDate
    ? t("overview.activeUntilLabel", {
        date: expiredAtDate.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", { day: "numeric", month: "long", year: "numeric" }),
      })
    : ""

  const attending = data.guestStatistic?.totalAttending ?? 0
  const declined = data.guestStatistic?.totalNotAttending ?? 0
  const pending = data.guestStatistic?.totalNotResponded ?? 0

  const coverHtml = buildCoverPreviewHtml(data.template, fieldValues)

  const handlePublish = () => {
    publishMutation.mutate(
      { name: data.name, slug: data.slug, fieldValues: data.fieldValues, status: "published", template: data.template },
      {
        onSuccess: () => toast(t("overview.publishedToast"), "success"),
        onError: () => toast(t("overview.actionError"), "error"),
      }
    )
  }

  const startEditingLink = () => {
    setSlugDraft(slug)
    setDebouncedSlugDraft(slug)
    setSlugAvailability("idle")
    setSlugError(null)
    setIsEditingLink(true)
  }

  const cancelEditingLink = () => {
    setIsEditingLink(false)
    setSlugError(null)
    setSlugAvailability("idle")
  }

  const handleSaveLink = async () => {
    const trimmed = slugDraft.trim()
    if (!trimmed) {
      setSlugError(t("overview.slugRequired"))
      return
    }
    if (!SLUG_PATTERN.test(trimmed)) {
      setSlugError(t("overview.slugInvalid"))
      return
    }
    if (trimmed === slug) {
      setIsEditingLink(false)
      return
    }
    if (slugAvailability !== "available") {
      setSlugError(t("overview.slugTaken"))
      return
    }

    setIsSavingLink(true)
    try {
      await linkMutation.mutateAsync({
        name: data.name,
        slug: trimmed,
        fieldValues: data.fieldValues,
        status: data.status,
        template: data.template,
      })
      toast(t("overview.linkUpdatedToast"), "success")
      setIsEditingLink(false)
    } catch {
      setSlugError(t("overview.actionError"))
    } finally {
      setIsSavingLink(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`momenia.com/${slug}`)
      toast(t("overview.linkCopiedToast"), "success")
    } catch {
      toast(t("overview.actionError"), "error")
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-8 xl:gap-20 xl:grid-cols-[336px_minmax(0,1fr)] xl:mt-6">

        {/* ── Left: Phone Preview ── */}
        <div className="xl:ml-6">
          <InvitationPhonePreview
            coverHtml={coverHtml}
            title={title}
            planName={planName}
            activeUntilLabel={activeUntilLabel}
            publishLabel={t("overview.publishNow")}
            publishedLabel={t("overview.published")}
            notActiveWarning={t("overview.notActiveWarning")}
            isPublished={isPublished}
            isPublishing={publishMutation.isPending}
            onPublish={handlePublish}
            editLabel={t("overview.editTemplate")}
            guestsLabel={t("overview.manageGuests")}
            editHref={`${basePath}/edit`}
            guestsHref={`${basePath}/guests`}
          />
        </div>

        {/* ── Right: Content ── */}
        <div className="flex flex-col gap-4 xl:gap-0">

          {/* Title + Date — cuma tampil desktop, di mobile tanggal event
              sudah terwakili lewat foto preview & tanggal countdown di bawah */}
          <div className="hidden items-start justify-between gap-2 xl:flex">
            <div className="flex-1">
              <h2 className={`${typography["5xl"].semibold} text-zinc-900`}>
                {title}
              </h2>
              <p className={`${typography["2xl"].regular} xl:mt-16`} style={{ color: "var(--semantic-border)" }}>
                {eventDateLabel}
              </p>
            </div>
            <Button asChild variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full text-zinc-400 hover:text-zinc-600">
              <Link href={`${basePath}/edit`} aria-label={t("overview.editTemplate")}>
                <PencilLine className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Countdown */}
          <WorkspaceCard className="border-0 shadow-none xl:border xl:shadow-sm p-4 pt-3 sm:p-5 xl:p-0 xl:mt-8">
            <p className="mb-3 text-center text-lg font-normal xl:hidden" style={{ color: "var(--semantic-border)" }}>
              {eventDateLabel}
            </p>
            <div className="grid grid-cols-4 xl:h-[136px]">
              {[
                { key: "days",    value: countdown.days },
                { key: "hours",   value: countdown.hours },
                { key: "minutes", value: countdown.minutes },
                { key: "seconds", value: countdown.seconds },
              ].map((item) => (
                <div key={item.key} className="flex flex-col items-center justify-center py-3 text-center sm:py-4 xl:py-0">
                  <p className={`text-2xl font-semibold leading-none sm:text-4xl xl:${typography["5xl"].medium}`} style={{ color: "var(--indigo-deep)" }}>
                    {item.value}
                  </p>
                  <p className={`mt-1.5 ${typography.xl.regular} sm:mt-2`} style={{ color: "var(--foreground)" }}>
                    {t(`overview.countdownUnits.${item.key}`)}
                  </p>
                </div>
              ))}
            </div>
          </WorkspaceCard>

          {/* Divider — mobile only, desktop pakai xl:mt-8 di section berikutnya */}
          <div className="h-px w-full xl:hidden" style={{ background: "var(--border)" }} />

          {/* Guest Stats */}
          <div className="space-y-4 xl:space-y-8 xl:mt-8">
            <h3 className="text-center text-lg font-normal xl:text-left xl:text-2xl" style={{ color: "var(--semantic-border)" }}>
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

                  <Button
                    asChild
                    className="h-12 w-full justify-start gap-3 rounded-[10px] border border-primary bg-white px-4 text-sm font-semibold text-primary hover:bg-primary/5 hover:text-primary sm:text-base xl:h-16 xl:rounded-xl xl:border-0 xl:bg-primary xl:p-4 xl:text-xl xl:font-semibold xl:text-primary-foreground xl:hover:bg-primary/90 xl:hover:text-primary-foreground"
                  >
                    <Link href={`${basePath}/rsvp`}>
                      <BookOpenCheck className="h-5 w-5 xl:h-8 xl:w-8" />
                      {t("sidebar.rsvp")}
                    </Link>
                  </Button>
                </div>
              </div>
            </WorkspaceCard>
          </div>

          {/* Divider — mobile only, desktop pakai xl:mt-8 di section berikutnya */}
          <div className="h-px w-full xl:hidden" style={{ background: "var(--border)" }} />

          {/* Invitation Link */}
          <div className="space-y-4 xl:mt-8 xl:space-y-3">
            <div className="hidden xl:flex xl:items-center xl:justify-between xl:gap-2">
              <h3 className={typography["2xl"].regular} style={{ color: "var(--semantic-border)" }}>
                {t("overview.invitationLink")}
              </h3>
              {!isEditingLink && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={startEditingLink} className="h-8 w-[118px] gap-1.5 rounded-md border border-zinc-200 px-3 text-sm font-medium" style={{ background: "var(--accent)" }}>
                    <PencilLine className="h-3.5 w-3.5" />
                    {t("common.editLink")}
                  </Button>
                  <Button size="sm" onClick={handleCopyLink} className="h-8 w-[96px] gap-1.5 rounded-md px-3 text-sm font-medium">
                    <Copy className="h-3.5 w-3.5" />
                    {t("common.copy")}
                  </Button>
                </div>
              )}
            </div>

            <h3 className="text-center text-lg font-normal xl:hidden" style={{ color: "var(--semantic-border)" }}>
              {t("overview.invitationLink")}
            </h3>

            {isEditingLink ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-sm text-zinc-500">momenia.com/</span>
                  <div className="relative flex-1">
                    <Input
                      value={slugDraft}
                      onChange={(e) => {
                        setSlugDraft(e.target.value)
                        setSlugError(null)
                      }}
                      className={cn(
                        "h-10 w-full rounded-lg pr-9 text-sm",
                        slugAvailability === "available" && "border-green-400 focus-visible:ring-green-100",
                        (slugAvailability === "taken" || slugAvailability === "invalid") && "border-red-400 focus-visible:ring-red-100"
                      )}
                      aria-label={t("overview.invitationLink")}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      {slugAvailability === "checking" && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}
                      {slugAvailability === "available" && <Check className="h-4 w-4 text-green-500" />}
                      {(slugAvailability === "taken" || slugAvailability === "invalid") && <X className="h-4 w-4 text-red-500" />}
                    </span>
                  </div>
                </div>
                {slugAvailability === "available" && <p className="text-xs text-green-600">{t("overview.slugAvailable")}</p>}
                {slugAvailability === "taken" && <p className="text-xs text-red-500">{t("overview.slugTaken")}</p>}
                {slugAvailability === "invalid" && <p className="text-xs text-red-500">{t("overview.slugInvalid")}</p>}
                {slugError && <p className="text-xs text-red-500">{slugError}</p>}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" disabled={isSavingLink} onClick={cancelEditingLink} className="h-9 flex-1 rounded-lg text-sm xl:flex-none xl:px-6">
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="button"
                    disabled={isSavingLink || slugAvailability === "checking" || slugAvailability === "taken" || slugAvailability === "invalid" || !slugDraft.trim()}
                    onClick={handleSaveLink}
                    className="h-9 flex-1 rounded-lg text-sm xl:flex-none xl:px-6"
                  >
                    {t("common.save")}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex overflow-hidden rounded-xl border border-zinc-200 shadow-sm xl:h-[60px] xl:items-center xl:rounded-lg xl:px-3 xl:gap-3">
                  <span className="flex shrink-0 items-center border-r border-zinc-200 bg-zinc-50 px-2 py-3 text-xs text-zinc-400 sm:px-3 sm:text-sm xl:h-[44px] xl:w-[196px] xl:justify-center xl:rounded-[4px] xl:border xl:border-zinc-200 xl:bg-zinc-50 xl:text-base xl:font-normal xl:px-3">
                    momenia.com/
                  </span>
                  <span className="flex min-w-0 flex-1 items-center truncate px-2 py-3 text-xs text-zinc-700 sm:px-3 sm:text-sm xl:text-base xl:font-normal xl:px-2">
                    {slug}
                  </span>
                  <span className="flex shrink-0 items-center border-l border-zinc-200 bg-zinc-50 px-2 py-3 text-xs text-zinc-400 sm:px-3 sm:text-sm xl:h-[44px] xl:w-[61px] xl:justify-center xl:rounded-lg xl:border xl:border-zinc-200 xl:bg-zinc-50 xl:text-base xl:font-normal xl:border-l-0">
                    .id
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 xl:hidden">
                  <Button variant="outline" onClick={startEditingLink} className="h-12 gap-2 rounded-xl border-zinc-200">
                    <PencilLine className="h-4 w-4" />
                    {t("common.editLink")}
                  </Button>
                  <Button onClick={handleCopyLink} className="h-12 gap-2 rounded-xl">
                    <Copy className="h-4 w-4" />
                    {t("common.copy")}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Edit Template / Kelola Tamu — dulu tombol ini ada di kolom kiri
              (bawah Publish Sekarang) & ada bagian "Template Pesan" di sini;
              sekarang digabung jadi 2 kartu besar berdampingan di sini.
              Versi mobile tetap pakai tombol outline di InvitationPhonePreview
              (di bawah foto), jadi baris ini cuma tampil di desktop. */}
          <div className="hidden gap-4 xl:mt-8 xl:grid xl:grid-cols-2">
            <WorkspaceActionCard
              href={`${basePath}/edit`}
              icon={SquarePen}
              topBadgeIcon={Palette}
              bottomBadgeIcon={TableProperties}
              title={t("overview.editTemplate")}
              subtitle={t("overview.editTemplateSubtitle")}
            />
            <WorkspaceActionCard
              href={`${basePath}/guests`}
              icon={Users}
              topBadgeIcon={MessageSquareText}
              bottomBadgeIcon={UserPlus}
              title={t("overview.manageGuests")}
              subtitle={t("overview.manageGuestsSubtitle")}
            />
          </div>

        </div>
      </div>
    </div>
  )
}
