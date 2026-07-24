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
      <div
        className="w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white shadow-2xl overflow-hidden"
        style={{ maxHeight: "600px" }}
      >
        {/* Split view */}
        <div className="flex h-full">
          {/* Left: Preview */}
          <div className="w-1/2 overflow-auto bg-zinc-50 border-r border-zinc-200">
            <div className="p-6">
              <h3 className="text-sm font-semibold text-zinc-600 mb-2">Preview of Unsaved Changes</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-zinc-500">Invitation Name</p>
                  <p className="font-medium text-zinc-900">{unsavedState.name || "Untitled"}</p>
                </div>
                <div className="border-t border-zinc-200 pt-3">
                  <p className="text-xs text-zinc-500 mb-2">Content Preview</p>
                  <div className="space-y-1 text-xs text-zinc-700">
                    {Object.entries(unsavedState.userData)
                      .slice(0, 5)
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between gap-2">
                          <span className="text-zinc-600">{key}:</span>
                          <span className="font-medium truncate">{value || "(empty)"}</span>
                        </div>
                      ))}
                    {Object.keys(unsavedState.userData).length > 5 && (
                      <p className="text-zinc-500 italic">
                        +{Object.keys(unsavedState.userData).length - 5} more fields
                      </p>
                    )}
                  </div>
                </div>
                <div className="border-t border-zinc-200 pt-3">
                  <p className="text-xs text-zinc-500 mb-2">Colors</p>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1">
                      <div
                        className="h-6 w-6 rounded"
                        style={{ background: unsavedState.theme.color_primary }}
                      />
                      <span className="text-xs text-zinc-600">Primary</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div
                        className="h-6 w-6 rounded"
                        style={{ background: unsavedState.theme.color_background }}
                      />
                      <span className="text-xs text-zinc-600">Secondary</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Message and Actions */}
          <div className="w-1/2 flex flex-col p-6 justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 mb-2">Unsaved Changes</h2>
              <p className="text-sm text-zinc-600">
                We found unsaved changes from <span className="font-medium">{formatDate(unsavedState.timestamp)}</span>.
              </p>
              <p className="text-sm text-zinc-600 mt-3">
                Would you like to restore these changes or discard them?
              </p>
            </div>

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
      </div>
    </div>
  )
}
