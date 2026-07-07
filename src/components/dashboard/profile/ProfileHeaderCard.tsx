"use client"

import Image from "next/image"
import { Pencil } from "lucide-react"

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
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-indigo-100 p-5 md:p-6">
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-white md:h-16 md:w-16">
          {profilePicture ? (
            <Image src={profilePicture} alt={name} width={64} height={64} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-indigo-200 text-lg font-semibold text-indigo-700">
              {initials}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-zinc-900 md:text-xl">{name}</p>
          <p className="truncate text-sm text-zinc-500">{email}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onEditClick}
        className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50"
      >
        <Pencil className="h-3.5 w-3.5" />
        {editLabel}
      </button>
    </div>
  )
}
