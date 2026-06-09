"use client"

import * as React from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUpDown, ChevronDown, Copy, GripVertical, ListPlus, PencilLine, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CheckboxTile } from "@/components/ui/checkbox-tile"
import type { InvitationWorkspaceGuest } from "@/lib/types/invitation-workspace"
import WhatsAppIcon from "@/assets/logo/whatsapp.svg"
import GoogleCalendarIcon from "@/assets/logo/google-calendar.svg"
import { WorkspaceCard } from "./WorkspaceCard"
import { WorkspaceTableFooter } from "./WorkspaceTableFooter"

/* ── Category header dropdown ── */
const DEFAULT_CATEGORIES = ["Reguler", "VIP"]

function CategoryHeaderDropdown({ label }: { label: string }) {
  const [open, setOpen] = React.useState(false)
  const [categories, setCategories] = React.useState(DEFAULT_CATEGORIES)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const remove = (cat: string) => setCategories((prev) => prev.filter((c) => c !== cat))

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 transition-colors hover:text-indigo-600"
      >
        {label}
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
            className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl"
          >
            {/* Category rows */}
            <div className="p-2">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                >
                  <span>{cat}</span>
                  <div className="flex items-center gap-2">
                    <button className="text-zinc-400 hover:text-indigo-500 transition-colors">
                      <PencilLine className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => remove(cat)}
                      className="text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tambah Kategori */}
            <div className="border-t border-zinc-100 p-2">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors">
                <ListPlus className="h-4 w-4" />
                Tambah Kategori
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Main table component ── */

type GuestsManagementTableProps = {
  title: string
  searchPlaceholder: string
  totalLabel: string
  sortLabel: string
  deleteLabel: string
  nameLabel: string
  whatsAppLabel: string
  emailLabel: string
  categoryLabel: string
  actionsLabel: string
  deliveredLabel: string
  selectionLabel: string
  rowsPerPageLabel: string
  pageLabel: string
  guests: InvitationWorkspaceGuest[]
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
  actionsLabel,
  deliveredLabel,
  selectionLabel,
  rowsPerPageLabel,
  pageLabel,
  guests,
}: GuestsManagementTableProps) {
  const [allChecked, setAllChecked] = React.useState(false)
  const [checked, setChecked] = React.useState<Record<string, boolean>>({})

  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))

  const toggleAll = () => {
    const next = !allChecked
    setAllChecked(next)
    setChecked(Object.fromEntries(guests.map((g) => [g.id, next])))
  }

  return (
    <WorkspaceCard className="flex flex-col gap-4 px-4 py-4 sm:px-6 xl:p-5 border-0 shadow-none xl:border xl:shadow-sm">

      {/* Title */}
      <h2 className="text-2xl font-semibold text-zinc-900">{title}</h2>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <Input
          aria-label={searchPlaceholder}
          placeholder={searchPlaceholder}
          className="h-9 min-w-0 flex-1 border-zinc-200 text-sm xl:max-w-80"
        />
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 whitespace-nowrap xl:inline-flex">
            {totalLabel}
          </span>
          <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors whitespace-nowrap">
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortLabel}
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-50 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">{deleteLabel}</span>
          </button>
        </div>
      </div>

      {/* Inner container: table */}
      <div className="overflow-hidden rounded-[10px] border border-zinc-200">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="bg-indigo-50 text-xs font-medium text-zinc-600">
                <th className="w-6 px-3 py-3" />
                <th className="px-3 py-3">
                  <button onClick={toggleAll}>
                    <CheckboxTile checked={allChecked} className="h-5 w-5 rounded-md" />
                  </button>
                </th>
                <th className="px-4 py-3">{nameLabel}</th>
                <th className="px-4 py-3">{whatsAppLabel}</th>
                <th className="px-4 py-3">{emailLabel}</th>
                <th className="px-4 py-3">
                  <CategoryHeaderDropdown label={categoryLabel} />
                </th>
                <th className="px-4 py-3">{actionsLabel}</th>
                <th className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1">
                    {deliveredLabel} <ChevronDown className="h-3 w-3" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="border-b border-zinc-100 px-3 py-3 align-middle">
                    <GripVertical className="h-4 w-4 text-zinc-300" />
                  </td>
                  <td className="border-b border-zinc-100 px-3 py-3 align-middle">
                    <button onClick={() => toggle(guest.id)}>
                      <CheckboxTile checked={!!checked[guest.id]} className="h-5 w-5 rounded-md" />
                    </button>
                  </td>
                  <td className="border-b border-zinc-100 px-4 py-3 align-middle">
                    <span className="block max-w-50 cursor-pointer truncate font-medium text-zinc-800 underline underline-offset-2">
                      {guest.name}
                    </span>
                  </td>
                  <td className="border-b border-zinc-100 px-4 py-3 align-middle text-xs text-zinc-500">
                    {guest.whatsApp}
                  </td>
                  <td className="border-b border-zinc-100 px-4 py-3 align-middle text-xs text-zinc-500">
                    {guest.email}
                  </td>
                  <td className="border-b border-zinc-100 px-4 py-3 align-middle">
                    <span className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-2.5 py-0.5 text-xs text-zinc-600">
                      {guest.category === "vip" ? "VIP" : "Reguler"}
                    </span>
                  </td>
                  <td className="border-b border-zinc-100 px-4 py-3 align-middle">
                    <div className="flex items-center gap-1.5">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors">
                        <Image src={WhatsAppIcon} alt="WhatsApp" className="h-4 w-4" />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors">
                        <Image src={GoogleCalendarIcon} alt="Google Calendar" className="h-4 w-4" />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 transition-colors">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="border-b border-zinc-100 px-4 py-3 text-center align-middle">
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
