"use client"

import Image from "next/image"
import { ChevronDown, Copy } from "lucide-react"
import { Input } from "@/components/ui/input"
import WhatsAppIcon from "@/assets/logo/whatsapp.svg"
import { CheckboxTile } from "@/components/ui/checkbox-tile"
import type { InvitationWorkspaceGuest } from "@/lib/types/invitation-workspace"
import { WorkspaceCard } from "./WorkspaceCard"
import { WorkspaceTableFooter } from "./WorkspaceTableFooter"

type AfterPartyRecipientsTableProps = {
  readonly title: string
  readonly subtitle: string
  readonly searchPlaceholder: string
  readonly nameLabel: string
  readonly categoryLabel: string
  readonly actionsLabel: string
  readonly deliveredLabel: string
  readonly selectionLabel: string
  readonly rowsPerPageLabel: string
  readonly pageLabel: string
  readonly guests: InvitationWorkspaceGuest[]
}

export function AfterPartyRecipientsTable({
  title,
  subtitle,
  searchPlaceholder,
  nameLabel,
  categoryLabel,
  actionsLabel,
  deliveredLabel,
  selectionLabel,
  rowsPerPageLabel,
  pageLabel,
  guests,
}: AfterPartyRecipientsTableProps) {
  return (
    <WorkspaceCard className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:p-5 border-0 shadow-none lg:border lg:shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      </div>

      <Input
        aria-label={searchPlaceholder}
        placeholder={searchPlaceholder}
        className="h-9 min-w-0 border-zinc-200 text-sm"
      />

      {/* Inner container: table */}
      <div className="overflow-hidden rounded-[10px] border border-zinc-200">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="bg-indigo-50 text-xs font-medium text-zinc-600">
                <th className="px-4 py-3">{nameLabel}</th>
                <th className="px-4 py-3">
                  <span className="inline-flex items-center gap-1">
                    {categoryLabel} <ChevronDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="px-4 py-3">{actionsLabel}</th>
                <th className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center gap-1">
                    {deliveredLabel} <ChevronDown className="h-3 w-3" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="border-b border-zinc-100 px-4 py-3 font-medium text-zinc-800">
                    {guest.name}
                  </td>
                  <td className="border-b border-zinc-100 px-4 py-3 text-xs text-zinc-600">
                    {guest.category === "vip" ? "VIP" : "Reguler"}
                  </td>
                  <td className="border-b border-zinc-100 px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors">
                        <Image src={WhatsAppIcon} alt="WhatsApp" className="h-4 w-4" />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 transition-colors">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="border-b border-zinc-100 px-4 py-3 text-center">
                    <div className="flex justify-center">
                      <CheckboxTile checked={guest.delivered} className="h-5 w-5 rounded-md" />
                    </div>
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
