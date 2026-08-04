import { Eye, EyeOff, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { WorkspaceBadge } from "./WorkspaceBadge"
import { WorkspaceCard } from "./WorkspaceCard"

type GuestMessageCardProps = {
  name: string
  content: string
  dateLabel: string
  voiceNote?: string
  voiceLabel: string
  isHidden: boolean
  hiddenBadgeLabel: string
  hideLabel: string
  showLabel: string
  deleteLabel: string
  onToggleHide: () => void
  onDelete: () => void
  isToggling?: boolean
  isDeleting?: boolean
}

export function GuestMessageCard({
  name,
  content,
  dateLabel,
  voiceNote,
  voiceLabel,
  isHidden,
  hiddenBadgeLabel,
  hideLabel,
  showLabel,
  deleteLabel,
  onToggleHide,
  onDelete,
  isToggling,
  isDeleting,
}: GuestMessageCardProps) {
  return (
    <WorkspaceCard className={cn("p-5 transition-opacity", isHidden && "opacity-60")}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-base font-semibold text-zinc-950">{name}</p>
          {isHidden && <WorkspaceBadge tone="neutral">{hiddenBadgeLabel}</WorkspaceBadge>}
        </div>
        {dateLabel && <p className="text-xs text-zinc-400">{dateLabel}</p>}
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-700">{content}</p>

      {voiceNote ? (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-medium text-zinc-500">{voiceLabel}</p>
          <audio controls src={voiceNote} className="h-9 w-full" />
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={isToggling}
          onClick={onToggleHide}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          {isHidden ? showLabel : hideLabel}
        </button>
        <button
          type="button"
          disabled={isDeleting}
          onClick={onDelete}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {deleteLabel}
        </button>
      </div>
    </WorkspaceCard>
  )
}
