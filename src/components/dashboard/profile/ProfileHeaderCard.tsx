"use client"

import Image from "next/image"
import { PenLine } from "lucide-react"

type ProfileHeaderCardProps = {
  name: string
  email: string
  profilePicture?: string
  editLabel: string
  onEditClick: () => void
}

export function ProfileHeaderCard({ name, email, profilePicture, editLabel, onEditClick }: ProfileHeaderCardProps) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div
      className="flex items-center justify-between gap-2 rounded-2xl p-4 xl:gap-4 xl:p-8"
      style={{
        background: "linear-gradient(135deg, rgba(237, 233, 254, 0.5) 0%, rgba(79, 70, 229, 0.09) 100%)",
      }}
    >
      <div className="flex min-w-0 items-center gap-3 xl:gap-5">
        <div
          className="h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-white xl:h-20 xl:w-20"
          style={{ boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(142,81,255,0.25)" }}
        >
          {profilePicture ? (
            <Image src={profilePicture} alt={name} width={80} height={80} unoptimized className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-indigo-200 text-base font-semibold text-indigo-700 xl:text-xl">
              {initials}
            </div>
          )}
        </div>
        <div className="min-w-0 xl:pr-8">
          <p className="truncate text-base font-semibold text-popover-foreground xl:text-xl">{name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground xl:text-sm">{email}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onEditClick}
        className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 xl:gap-1.5 xl:px-3 xl:py-2 xl:text-sm"
      >
        <PenLine className="h-3 w-3 xl:h-3.5 xl:w-3.5" />
        {editLabel}
      </button>
    </div>
  )
}
