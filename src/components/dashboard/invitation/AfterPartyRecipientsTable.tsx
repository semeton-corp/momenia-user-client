"use client"

import Image from "next/image"
import { ChevronDown, Copy } from "lucide-react"
import { Input } from "@/components/ui/input"
import WhatsAppIcon from "@/assets/logo/whatsapp.svg"
import { CheckboxTile } from "@/components/ui/checkbox-tile"
import type { GuestInvitation } from "@/lib/api/guest-invitation/guest-invitation.types"
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
  readonly emptyLabel: string
  readonly selectionLabel: string
  readonly rowsPerPageLabel: string
  readonly pageLabel: string
  readonly guests: GuestInvitation[]
  readonly onCopyMessage: (guest: GuestInvitation) => void
  readonly onSendWhatsApp: (guest: GuestInvitation) => void
  readonly onToggleDelivered: (guest: GuestInvitation) => void
  readonly togglingDeliveredId?: string | null
  readonly searchValue: string
  readonly onSearchChange: (value: string) => void
  readonly pageSize?: number
  readonly onPageSizeChange?: (size: number) => void
  readonly canGoPrev?: boolean
  readonly canGoNext?: boolean
  readonly onFirstPage?: () => void
  readonly onPrevPage?: () => void
  readonly onNextPage?: () => void
}

export function AfterPartyRecipientsTable({
  title,
  subtitle,
  searchPlaceholder,
  nameLabel,
  categoryLabel,
  actionsLabel,
  deliveredLabel,
  emptyLabel,
  selectionLabel,
  rowsPerPageLabel,
  pageLabel,
  guests,
  onCopyMessage,
  onSendWhatsApp,
  onToggleDelivered,
  togglingDeliveredId,
  searchValue,
  onSearchChange,
  pageSize,
  onPageSizeChange,
  canGoPrev,
  canGoNext,
  onFirstPage,
  onPrevPage,
  onNextPage,
}: AfterPartyRecipientsTableProps) {
  const footerProps = {
    selectionLabel,
    rowsPerPageLabel,
    pageLabel,
    pageSize,
    onPageSizeChange,
    canGoPrev,
    canGoNext,
    onFirstPage,
    onPrevPage,
    onNextPage,
  }

  return (
    <WorkspaceCard className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:p-8 border-0 shadow-none lg:border lg:shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground lg:text-base">{subtitle}</p>
      </div>

      <Input
        aria-label={searchPlaceholder}
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-9 min-w-0 border-zinc-200 text-sm"
      />

      <div className="overflow-hidden rounded-[10px] border border-zinc-200">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="bg-indigo-50 text-sm font-medium text-foreground">
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
              {guests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="border-b border-zinc-100 px-4 py-10 text-center text-sm text-zinc-400">
                    {emptyLabel}
                  </td>
                </tr>
              ) : (
                guests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="border-b border-zinc-100 px-4 py-3 text-sm font-medium text-foreground">
                      {guest.name}
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-3">
                      <span className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-2.5 py-0.5 text-xs font-medium text-popover-foreground">
                        {guest.guestInvitationCategory}
                      </span>
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSendWhatsApp(guest)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors"
                        >
                          <Image src={WhatsAppIcon} alt="WhatsApp" className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onCopyMessage(guest)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <button
                          type="button"
                          disabled={togglingDeliveredId === guest.id}
                          onClick={() => onToggleDelivered(guest)}
                          className="disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckboxTile checked={guest.isAfterPartyNoteSent} className="h-5 w-5 rounded-md" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop: footer inside bordered container */}
        <div className="hidden lg:block">
          <WorkspaceTableFooter {...footerProps} />
        </div>
      </div>

      {/* Mobile: footer outside bordered container */}
      <div className="lg:hidden">
        <WorkspaceTableFooter {...footerProps} />
      </div>
    </WorkspaceCard>
  )
}
