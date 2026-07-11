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
      className="group flex h-[80px] w-full cursor-pointer items-center gap-4 rounded-2xl border border-red-200 bg-white px-4 py-5 text-left transition-colors hover:border-destructive hover:bg-destructive xl:w-fit xl:min-w-[281px]"
    >
      <div className="flex h-[35px] w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-destructive transition-colors group-hover:bg-white">
        <LogOut className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="whitespace-nowrap text-sm font-semibold text-destructive transition-colors group-hover:text-white">{title}</p>
        <p className="whitespace-nowrap text-xs font-normal text-muted-foreground transition-colors group-hover:text-white">{subtitle}</p>
      </div>
    </button>
  )
}
