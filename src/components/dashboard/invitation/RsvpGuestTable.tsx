"use client"

import * as React from "react"
import { ChevronDown, Settings2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { InvitationWorkspaceGuest } from "@/lib/types/invitation-workspace"
import { WorkspaceBadge } from "./WorkspaceBadge"
import { WorkspaceCard } from "./WorkspaceCard"
import { WorkspaceTableFooter } from "./WorkspaceTableFooter"

type RsvpGuestTableProps = {
  title: string
  searchPlaceholder: string
  sortLabel: string
  nameLabel: string
  whatsAppLabel: string
  emailLabel: string
  categoryLabel: string
  attendanceLabel: string
  guestCountLabel: string
  selectionLabel: string
  rowsPerPageLabel: string
  pageLabel: string
  guests: InvitationWorkspaceGuest[]
}

function resolveAttendanceTone(attendance: InvitationWorkspaceGuest["attendance"]) {
  if (attendance === "attending") return "green" as const
  if (attendance === "declined") return "red" as const
  return "amber" as const
}

function resolveAttendanceLabel(attendance: InvitationWorkspaceGuest["attendance"]) {
  if (attendance === "attending") return "Hadir"
  if (attendance === "declined") return "Tidak Hadir"
  return "Belum Konfirmasi"
}

export function RsvpGuestTable({
  title,
  searchPlaceholder,
  sortLabel,
  nameLabel,
  whatsAppLabel,
  emailLabel,
  categoryLabel,
  attendanceLabel,
  guestCountLabel,
  selectionLabel,
  rowsPerPageLabel,
  pageLabel,
  guests,
}: RsvpGuestTableProps) {
  return (
    <WorkspaceCard className="flex flex-col gap-4 px-4 py-4 sm:px-6 xl:p-5 border-0 shadow-none xl:border xl:shadow-sm">
      <h2 className="text-2xl font-semibold text-zinc-900 xl:mb-2">{title}</h2>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <Input
          aria-label={searchPlaceholder}
          placeholder={searchPlaceholder}
          className="h-9 min-w-0 flex-1 border-zinc-200 text-sm xl:max-w-80"
        />
        <button className="flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors whitespace-nowrap">
          <Settings2 className="h-3.5 w-3.5" />
          {sortLabel}
        </button>
      </div>

      {/* Inner container: table */}
      <div className="overflow-hidden rounded-[10px] border border-zinc-200">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="bg-indigo-50 text-sm font-medium text-foreground">
                <th className="px-4 py-3">{nameLabel}</th>
                <th className="px-4 py-3">{whatsAppLabel}</th>
                <th className="px-4 py-3">{emailLabel}</th>
                <th className="px-4 py-3">
                  <span className="inline-flex items-center gap-1">
                    {categoryLabel} <ChevronDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="px-4 py-3">
                  <span className="inline-flex items-center gap-1">
                    {attendanceLabel} <ChevronDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="px-4 py-3">{guestCountLabel}</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="border-b border-zinc-100 px-4 py-3 text-sm font-medium text-foreground">
                    {guest.name}
                  </td>
                  <td className="border-b border-zinc-100 px-4 py-3 text-sm font-normal text-foreground">
                    {guest.whatsApp}
                  </td>
                  <td className="border-b border-zinc-100 px-4 py-3 text-sm font-normal text-foreground">
                    {guest.email}
                  </td>
                  <td className="border-b border-zinc-100 px-4 py-3">
                    <span className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-2.5 py-0.5 text-xs font-medium text-popover-foreground">
                      {guest.category === "vip" ? "VIP" : "Reguler"}
                    </span>
                  </td>
                  <td className="border-b border-zinc-100 px-4 py-3">
                    <WorkspaceBadge tone={resolveAttendanceTone(guest.attendance)} className="text-popover-foreground">
                      {resolveAttendanceLabel(guest.attendance)}
                    </WorkspaceBadge>
                  </td>
                  <td className="border-b border-zinc-100 px-4 py-3 text-sm font-normal text-foreground">
                    {guest.guestCount} orang
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Desktop: footer inside bordered container */}
        <div className="hidden lg:block">
          <WorkspaceTableFooter
            selectionLabel={selectionLabel}
            rowsPerPageLabel={rowsPerPageLabel}
            pageLabel={pageLabel}
          />
        </div>
      </div>

      {/* Mobile: footer outside bordered container */}
      <div className="lg:hidden">
        <WorkspaceTableFooter
          selectionLabel={selectionLabel}
          rowsPerPageLabel={rowsPerPageLabel}
          pageLabel={pageLabel}
        />
      </div>
    </WorkspaceCard>
  )
}
