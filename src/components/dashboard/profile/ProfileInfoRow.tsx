import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type ProfileInfoRowProps = {
  icon: LucideIcon
  label: string
  value: string
  isLast?: boolean
}

export function ProfileInfoRow({ icon: Icon, label, value, isLast }: ProfileInfoRowProps) {
  return (
    <div className={cn("flex items-center gap-3 px-5 py-4 md:px-6 md:py-5", !isLast && "border-b border-zinc-100")}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-normal text-zinc-500">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-zinc-900">{value}</p>
      </div>
    </div>
  )
}
