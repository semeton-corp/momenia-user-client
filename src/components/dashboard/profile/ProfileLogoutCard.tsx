import { LogOut } from "lucide-react"

type ProfileLogoutCardProps = {
  title: string
  subtitle: string
  onClick: () => void
}

export function ProfileLogoutCard({ title, subtitle, onClick }: ProfileLogoutCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full max-w-sm cursor-pointer items-center gap-3 rounded-2xl border border-red-200 bg-white px-5 py-4 text-left transition-colors hover:bg-red-50/50"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
        <LogOut className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-red-600">{title}</p>
        <p className="truncate text-xs text-zinc-500">{subtitle}</p>
      </div>
    </button>
  )
}
