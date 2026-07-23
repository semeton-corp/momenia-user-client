"use client"

type UnsavedChangesModalProps = {
  onConfirm: () => void
  onCancel: () => void
}

export function UnsavedChangesModal({ onConfirm, onCancel }: UnsavedChangesModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-zinc-900">Are you sure want to move to this page?</h3>
        <p className="mt-2 text-sm text-zinc-600">
          You&apos;re unsave changes will be discard.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-500 py-2 font-medium text-white transition-colors hover:bg-red-600"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-zinc-300 bg-white py-2 font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
          >
            No
          </button>
        </div>
      </div>
    </div>
  )
}
