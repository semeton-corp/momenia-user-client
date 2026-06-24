"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { useUserInvitationOverview, useUserInvitations } from "@/hooks/useUserInvitations"
import { UserInvitation } from "@/lib/api/user-invitation/user-invitation.types"

type StatusFilter = "all" | "published" | "draft" | "expired"

const STATUS_FILTERS: StatusFilter[] = ["all", "published", "draft", "expired"]

function StatusBadge({ status }: { status: UserInvitation["status"] }) {
  const colors: Record<string, string> = {
    published: "bg-green-100 text-green-700",
    draft: "bg-yellow-100 text-yellow-700",
    expired: "bg-red-100 text-red-700",
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colors[status] ?? ""}`}>
      {status}
    </span>
  )
}

function StatCard({ dot, count, label, sub }: { dot: string; count: number; label: string; sub: string }) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-2xl font-bold text-zinc-900">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        {count}
      </div>
      <p className="mt-1 text-sm font-medium text-zinc-700">{label}</p>
      <p className="text-xs text-zinc-400">{sub}</p>
    </div>
  )
}

export default function MyInvitationPage() {
  const t = useTranslations("dashboard.myInvitation")
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all")
  const [keyword, setKeyword] = useState("")

  const { data: overview } = useUserInvitationOverview()
  const { data: invitations = [], isLoading } = useUserInvitations(
    activeFilter === "all"
      ? { keyword: keyword || undefined }
      : { statuses: [activeFilter], keyword: keyword || undefined }
  )

  const filterLabel: Record<StatusFilter, string> = {
    all: "All",
    published: "Published",
    draft: "Draft",
    expired: "Expired",
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-6 p-5 md:p-8">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-4xl font-bold text-zinc-950">My Invitations</h1>
        <p className="text-sm text-zinc-500">
          Kelola semua invitation yang pernah dibuat, lanjutkan draft, pantau status publish, dan buka dashboard project dari satu tempat.
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard dot="bg-zinc-400" count={overview?.totalInvitation ?? 0} label="Total invitations" sub="Semua project yang pernah dibuat" />
        <StatCard dot="bg-green-500" count={overview?.totalPublishedInvitation ?? 0} label="Published" sub="Invitation aktif dan bisa dibagikan" />
        <StatCard dot="bg-yellow-500" count={overview?.totalDraftInvitation ?? 0} label="Draft" sub="Belum dipublish, lanjutkan editing" />
        <StatCard dot="bg-red-500" count={overview?.totalExpiredInvitation ?? 0} label="Expired" sub="Butuh perpanjangan paket" />
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl bg-zinc-100 p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === f ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {filterLabel[f]}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search invitations..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-indigo-400 sm:w-64"
        />
      </div>

      {/* Invitation list */}
      <div className="flex flex-col gap-3">
        {isLoading && (
          <div className="py-12 text-center text-sm text-zinc-400">Loading...</div>
        )}
        {!isLoading && invitations.length === 0 && (
          <div className="py-12 text-center text-sm text-zinc-400">No invitations found.</div>
        )}
        {invitations.map((inv) => (
          <div key={inv.id} className="flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
            <div className="flex flex-1 flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-lg font-semibold text-zinc-900">{inv.name || "Untitled"}</p>
                <StatusBadge status={inv.status} />
              </div>
              <p className="text-sm text-zinc-500">
                {inv.invitationTemplateCategory} {inv.eventDate ? `• ${new Date(inv.eventDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}` : ""}
              </p>
              {inv.lastUpdatedAt && (
                <p className="text-xs text-zinc-400">
                  Last modified {new Date(inv.lastUpdatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
              {inv.pathUrl && (
                <p className="text-xs text-zinc-400">momenia.com/{inv.pathUrl}</p>
              )}
              {inv.status === "draft" && !inv.pathUrl && (
                <p className="text-xs text-zinc-400">Complete setup to publish</p>
              )}
            </div>

            {/* Guest / RSVP stats */}
            <div className="flex shrink-0 items-center gap-6">
              {inv.status !== "draft" && (
                <>
                  <div className="text-center">
                    <p className="text-xl font-bold text-zinc-900">{inv.totalGuest ?? 0}</p>
                    <p className="text-xs text-zinc-400">Guests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-zinc-900">{inv.totalRsvp ?? 0}</p>
                    <p className="text-xs text-zinc-400">RSVP</p>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              {inv.status === "published" && (
                <>
                  <Link
                    href={`/dashboard/my-invitation/${inv.id}`}
                    className="flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Open Dashboard
                  </Link>
                  <button className="flex h-10 items-center justify-center rounded-xl border border-zinc-200 px-5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
                    Copy Link
                  </button>
                  <p className="text-xs text-zinc-400">View analytics, manage guest list, or update invitation content.</p>
                </>
              )}
              {inv.status === "draft" && (
                <>
                  <Link
                    href={`/dashboard/my-invitation/${inv.id}`}
                    className="flex h-10 items-center justify-center rounded-xl border border-indigo-600 px-5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                  >
                    Continue Edit
                  </Link>
                  <button className="flex h-10 items-center justify-center rounded-xl border border-zinc-200 px-5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
                    Preview
                  </button>
                  <p className="text-xs text-zinc-400">Finish invitation details before publishing.</p>
                </>
              )}
              {inv.status === "expired" && (
                <button className="flex h-10 items-center justify-center rounded-xl bg-red-100 px-5 text-sm font-semibold text-red-600 transition hover:bg-red-200">
                  Renew
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
