"use client"

import * as React from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Copy, GripVertical, Settings2, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CheckboxTile } from "@/components/ui/checkbox-tile"
import type { GuestInvitation } from "@/lib/api/guest-invitation/guest-invitation.types"
import WhatsAppIcon from "@/assets/logo/whatsapp.svg"
import GoogleCalendarIcon from "@/assets/logo/google-calendar.svg"
import { WorkspaceCard } from "./WorkspaceCard"
import { WorkspaceTableFooter } from "./WorkspaceTableFooter"

type CategoryOption = { value: string; label: string }

/* ── Category filter dropdown ── */
function CategoryFilterDropdown({
  label,
  allLabel,
  options,
  value,
  onChange,
}: {
  label: string
  allLabel: string
  options: CategoryOption[]
  value: string | null
  onChange: (value: string | null) => void
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const activeLabel = options.find((opt) => opt.value === value)?.label ?? allLabel

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 transition-colors hover:text-indigo-600"
      >
        {value ? activeLabel : label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-3 w-3" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl"
          >
            <button
              type="button"
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                value === null ? "bg-indigo-500 text-white" : "text-zinc-800 hover:bg-zinc-50"
              }`}
            >
              {allLabel}
            </button>
            {options.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  value === opt.value ? "bg-indigo-500 text-white" : "text-zinc-800 hover:bg-zinc-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

type WorkspaceTableFooterPassthrough = {
  selectionLabel: string
  rowsPerPageLabel: string
  pageLabel: string
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  canGoPrev?: boolean
  canGoNext?: boolean
  onFirstPage?: () => void
  onPrevPage?: () => void
  onNextPage?: () => void
}

/* ── Main table component ── */

type GuestsManagementTableProps = WorkspaceTableFooterPassthrough & {
  title: string
  searchPlaceholder: string
  totalLabel: string
  sortLabel: string
  deleteLabel: string
  nameLabel: string
  whatsAppLabel: string
  emailLabel: string
  categoryLabel: string
  allCategoriesLabel: string
  actionsLabel: string
  deliveredLabel: string
  emptyLabel: string
  guests: GuestInvitation[]
  searchValue: string
  onSearchChange: (value: string) => void
  onSortToggle: () => void
  categoryOptions: CategoryOption[]
  categoryFilter: string | null
  onCategoryFilterChange: (value: string | null) => void
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onDeleteSelected: () => void
  onEditGuest: (guest: GuestInvitation) => void
  onToggleDelivered: (guest: GuestInvitation) => void
  togglingDeliveredId?: string | null
}

export function GuestsManagementTable({
  title,
  searchPlaceholder,
  totalLabel,
  sortLabel,
  deleteLabel,
  nameLabel,
  whatsAppLabel,
  emailLabel,
  categoryLabel,
  allCategoriesLabel,
  actionsLabel,
  deliveredLabel,
  emptyLabel,
  guests,
  searchValue,
  onSearchChange,
  onSortToggle,
  categoryOptions,
  categoryFilter,
  onCategoryFilterChange,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onDeleteSelected,
  onEditGuest,
  onToggleDelivered,
  togglingDeliveredId,
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
}: GuestsManagementTableProps) {
  const allChecked = guests.length > 0 && selectedIds.length === guests.length

  const footerProps: WorkspaceTableFooterPassthrough = {
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
    <WorkspaceCard className="flex flex-col gap-4 px-4 py-4 sm:px-6 xl:gap-0 xl:py-8 xl:px-5 border-0 shadow-none xl:border xl:shadow-sm xl:min-h-[798px]">

      {/* Title */}
      <h2 className="text-2xl font-semibold text-zinc-900 xl:mb-8">{title}</h2>

      {/* Toolbar */}
      <div className="flex items-center gap-2 xl:mb-4 xl:justify-between">
        <Input
          aria-label={searchPlaceholder}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 min-w-0 flex-1 border-zinc-200 text-sm xl:w-[402px] xl:flex-none xl:rounded-lg xl:border xl:text-base xl:font-normal"
          style={{ background: "#ffffff", color: "var(--foreground)" }}
        />
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden whitespace-nowrap rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 xl:inline-flex xl:items-center xl:rounded-lg xl:text-xs xl:font-medium" style={{ background: "#ffffff", color: "var(--foreground)" }}>
            {totalLabel}
          </span>
          <button
            type="button"
            onClick={onSortToggle}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 transition-colors whitespace-nowrap hover:bg-zinc-50 xl:rounded-lg xl:text-xs xl:font-medium"
            style={{ background: "#ffffff", color: "var(--foreground)" }}
          >
            <Settings2 className="h-3.5 w-3.5" />
            {sortLabel}
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={onDeleteSelected}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 xl:rounded-lg xl:text-xs xl:font-medium"
            style={{ background: "#ffffff", color: selectedIds.length > 0 ? "var(--foreground)" : undefined }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">{deleteLabel}</span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-zinc-200">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="bg-indigo-50 text-sm font-medium text-foreground">
                <th className="w-6 px-3 py-3" />
                <th className="px-3 py-3">
                  <button type="button" onClick={onToggleSelectAll}>
                    <CheckboxTile checked={allChecked} className="h-5 w-5 rounded-md" />
                  </button>
                </th>
                <th className="px-4 py-3">{nameLabel}</th>
                <th className="px-4 py-3">{whatsAppLabel}</th>
                <th className="px-4 py-3">{emailLabel}</th>
                <th className="px-4 py-3">
                  <CategoryFilterDropdown
                    label={categoryLabel}
                    allLabel={allCategoriesLabel}
                    options={categoryOptions}
                    value={categoryFilter}
                    onChange={onCategoryFilterChange}
                  />
                </th>
                <th className="px-4 py-3">{actionsLabel}</th>
                <th className="px-4 py-3 text-center">{deliveredLabel}</th>
              </tr>
            </thead>
            <tbody>
              {guests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="border-b border-zinc-100 px-4 py-10 text-center text-sm text-zinc-400">
                    {emptyLabel}
                  </td>
                </tr>
              ) : (
                guests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="border-b border-zinc-100 px-3 py-3 align-middle">
                      <GripVertical className="h-4 w-4 text-zinc-300" />
                    </td>
                    <td className="border-b border-zinc-100 px-3 py-3 align-middle">
                      <button type="button" onClick={() => onToggleSelect(guest.id)}>
                        <CheckboxTile checked={selectedIds.includes(guest.id)} className="h-5 w-5 rounded-md" />
                      </button>
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-3 align-middle">
                      <button
                        type="button"
                        onClick={() => onEditGuest(guest)}
                        className="block max-w-50 cursor-pointer truncate text-left text-sm font-medium text-foreground underline underline-offset-2"
                      >
                        {guest.name}
                      </button>
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-3 align-middle text-sm font-normal text-foreground">
                      {guest.whatsAppNumber}
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-3 align-middle text-sm font-normal text-foreground">
                      {guest.email}
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-3 align-middle">
                      <span className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-2.5 py-0.5 text-xs font-medium text-popover-foreground">
                        {guest.guestInvitationCategory}
                      </span>
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-3 align-middle">
                      <div className="flex items-center gap-1.5">
                        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors">
                          <Image src={WhatsAppIcon} alt="WhatsApp" className="h-4 w-4" />
                        </button>
                        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors">
                          <Image src={GoogleCalendarIcon} alt="Google Calendar" className="h-4 w-4" />
                        </button>
                        <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 transition-colors">
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="border-b border-zinc-100 px-4 py-3 text-center align-middle">
                      <div className="flex justify-center">
                        <button
                          type="button"
                          disabled={togglingDeliveredId === guest.id}
                          onClick={() => onToggleDelivered(guest)}
                          className="disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckboxTile checked={guest.isInvitationSent} className="h-5 w-5 rounded-md" />
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
