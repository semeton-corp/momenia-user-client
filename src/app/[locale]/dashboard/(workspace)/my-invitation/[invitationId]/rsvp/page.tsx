import { UsersRound } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { DonutChart } from "@/components/dashboard/invitation/DonutChart"
import { InvitationWorkspaceHeader } from "@/components/dashboard/invitation/InvitationWorkspaceHeader"
import { RsvpGuestTable } from "@/components/dashboard/invitation/RsvpGuestTable"
import { SummaryStatCard } from "@/components/dashboard/invitation/SummaryStatCard"
import { WorkspaceCard } from "@/components/dashboard/invitation/WorkspaceCard"
import { getInvitationWorkspaceData } from "@/lib/mocks/invitation-workspace"

const INDIGO_DEEP = "#1F1B74"

type Props = {
  readonly params: Promise<{ locale: string; invitationId: string }>
}

export default async function RsvpPage({ params }: Props) {
  const { locale, invitationId } = await params
  const t = await getTranslations("dashboard.workspace")
  const data = getInvitationWorkspaceData(invitationId, locale)

  return (
    <div className="space-y-6">

      {/* Header — hidden on mobile */}
      <div className="hidden xl:block">
        <InvitationWorkspaceHeader title={t("rsvp.title")} subtitle={data.title} />
      </div>

      {/* ── Mobile stats layout ── */}
      <div className="flex flex-col gap-5 xl:hidden">

        {/* Total Tamu card */}
        <WorkspaceCard className="p-4 text-center">
          <p className="text-sm text-zinc-500">{t("rsvp.totalGuests")}</p>
          <p className="mt-1 text-4xl font-semibold text-zinc-950">{data.stats.totalGuests}</p>
        </WorkspaceCard>

        {/* Statistik Tamu */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm font-medium text-zinc-500">{t("overview.guestStatsTitle")}</p>

          <DonutChart
            sizeClassName="h-52 w-52"
            segments={[
              { value: data.stats.attending, color: "#4338CA" },
              { value: data.stats.declined,  color: "#818CF8" },
              { value: data.stats.pending,   color: "#C7D2FE" },
            ]}
          />

          <div className="grid w-full grid-cols-3 gap-2">
            {[
              { value: data.stats.attending, label: t("common.attending"), color: "#4338CA" },
              { value: data.stats.declined,  label: t("common.declined"),  color: "#818CF8" },
              { value: data.stats.pending,   label: t("common.pending"),   color: "#C7D2FE" },
            ].map(({ value, label, color }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <p className="text-2xl font-semibold leading-none" style={{ color: INDIGO_DEEP }}>{value}</p>
                <div className="my-1.5 h-0.5 w-8 rounded-full" style={{ background: color }} />
                <p className="text-xs text-zinc-700">{label}</p>
              </div>
            ))}
          </div>

          {/* Estimasi row */}
          <div className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm border border-zinc-100">
            <UsersRound className="h-4 w-4 shrink-0" />
            <span className="flex-1">{t("rsvp.estimatedGuests")}</span>
            <p className="text-2xl font-semibold text-zinc-950">{data.stats.estimatedGuests}</p>
          </div>
        </div>
      </div>

      {/* ── Desktop stats layout ── */}
      <WorkspaceCard className="hidden p-6 xl:block">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:gap-8">
          <div className="flex shrink-0 justify-center xl:justify-start">
            <DonutChart
              sizeClassName="h-52 w-52"
              segments={[
                { value: data.stats.attending, color: "#4338CA" },
                { value: data.stats.declined,  color: "#818CF8" },
                { value: data.stats.pending,   color: "#C7D2FE" },
              ]}
            />
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryStatCard label={t("rsvp.totalGuests")} value={data.stats.totalGuests} />
              <SummaryStatCard label={t("common.attending")} value={data.stats.attending} markerColor="#4338CA" />
              <SummaryStatCard label={t("common.declined")}  value={data.stats.declined}  markerColor="#818CF8" />
              <SummaryStatCard label={t("common.pending")}   value={data.stats.pending}   markerColor="#C7D2FE" />
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-violet-50 px-5 py-4">
              <div className="flex items-center gap-3 text-sm text-zinc-700">
                <UsersRound className="h-4 w-4 shrink-0" />
                <span>{t("rsvp.estimatedGuests")}</span>
              </div>
              <p className="text-3xl font-semibold text-zinc-950">{data.stats.estimatedGuests}</p>
            </div>
          </div>
        </div>
      </WorkspaceCard>

      {/* Guest table — edge-to-edge on mobile */}
      <div className="-mx-4 sm:-mx-6 xl:mx-0">
        <RsvpGuestTable
          title={t("rsvp.listTitle")}
          searchPlaceholder={t("common.searchGuests")}
          sortLabel={t("common.sort")}
          nameLabel={t("guests.table.name")}
          whatsAppLabel={t("guests.table.whatsApp")}
          emailLabel={t("guests.table.email")}
          categoryLabel={t("guests.table.category")}
          attendanceLabel={t("rsvp.table.attendance")}
          guestCountLabel={t("rsvp.table.guestCount")}
          selectionLabel={t("common.selectedRows", { count: 0, total: data.guests.length })}
          rowsPerPageLabel={t("common.rowsPerPage")}
          pageLabel={t("common.pageLabel", { current: 1, total: 1 })}
          guests={data.guests}
        />
      </div>

    </div>
  )
}
