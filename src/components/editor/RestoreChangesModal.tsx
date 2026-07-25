"use client"

import { UserInvitationDetail } from "@/lib/api/user-invitation/user-invitation.types"

type UnsavedState = {
  name: string
  userData: Record<string, string>
  theme: UserInvitationDetail["template"]["theme_defaults"]
  sectionOrder: string[]
  timestamp: number
}

type RestoreChangesModalProps = {
  unsavedState: UnsavedState
  detail: UserInvitationDetail
  onRestore: (state: UnsavedState) => void
  onDiscard: () => void
}

export function RestoreChangesModal({
  unsavedState,
  onRestore,
  onDiscard,
}: RestoreChangesModalProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - timestamp
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl p-6">
        <h2 className="text-lg font-semibold text-zinc-900 mb-2">Unsaved Changes</h2>
        <p className="text-sm text-zinc-600 mb-6">
          We found unsaved changes from <span className="font-medium">{formatDate(unsavedState.timestamp)}</span>.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => onDiscard()}
            className="flex-1 rounded-lg border border-zinc-300 bg-white py-2.5 font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
          >
            Delete Changes
          </button>
          <button
            onClick={() => onRestore(unsavedState)}
            className="flex-1 rounded-lg bg-indigo-600 py-2.5 font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Restore
          </button>
        </div>
      </div>
    </div>
  )
}
