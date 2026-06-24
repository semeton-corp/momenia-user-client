import { EyeOff, Play, Trash2 } from "lucide-react"
import type { GuestMessage } from "@/lib/types/invitation-workspace"
import { WorkspaceBadge } from "./WorkspaceBadge"
import { WorkspaceCard } from "./WorkspaceCard"

type GuestMessageCardProps = {
  message: GuestMessage
  voiceLabel: string
  hideLabel: string
  deleteLabel: string
}

export function GuestMessageCard({
  message,
  voiceLabel,
  hideLabel,
  deleteLabel,
}: GuestMessageCardProps) {
  return (
    <WorkspaceCard className="p-5">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-base font-semibold text-zinc-950">{message.senderName}</p>
          <WorkspaceBadge tone="neutral">
            {message.category === "vip" ? "VIP" : "Reguler"}
          </WorkspaceBadge>
        </div>
        <p className="text-xs text-zinc-400">{message.submittedAt}</p>
      </div>

      <p className="mt-4 text-sm leading-7 text-zinc-700">{message.content}</p>

      {message.voiceNoteDuration ? (
        <button className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3 text-left text-sm font-medium text-zinc-700">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300">
            <Play className="h-3.5 w-3.5" />
          </span>
          <span>
            {voiceLabel}
            <span className="mt-1 block text-xs text-zinc-400">{message.voiceNoteDuration}</span>
          </span>
        </button>
      ) : null}

      <div className="mt-6 flex items-center justify-end gap-2">
        <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-700">
          <EyeOff className="h-3.5 w-3.5" />
          {hideLabel}
        </button>
        <button className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs text-rose-600">
          <Trash2 className="h-3.5 w-3.5" />
          {deleteLabel}
        </button>
      </div>
    </WorkspaceCard>
  )
}
