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
    <div className={cn("flex items-center gap-3 px-4 py-3 xl:px-6 xl:py-5", !isLast && "border-b border-zinc-100")}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-primary xl:h-[42px] xl:w-[42px]">
        <Icon className="h-4 w-4 xl:h-5 xl:w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-normal text-muted-foreground xl:text-sm">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-popover-foreground xl:text-base">{value}</p>
      </div>
    </div>
  )
}
