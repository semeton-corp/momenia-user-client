import * as React from "react"
import { cn } from "@/lib/utils"

type WorkspaceBadgeTone = "violet" | "neutral" | "green" | "red" | "amber"

const toneClasses: Record<WorkspaceBadgeTone, string> = {
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  neutral: "border-zinc-200 bg-white text-zinc-600",
  green: "border-[#86EFAC] bg-[#BBF7D0] text-green-800",
  red: "border-[#FCA5A5] bg-[#FECACA] text-red-800",
  amber: "border-[#FCD34D] bg-[#FDE68A] text-amber-800",
}

type WorkspaceBadgeProps = React.ComponentProps<"span"> & {
  tone?: WorkspaceBadgeTone
}

export function WorkspaceBadge({
  className,
  tone = "neutral",
  ...props
}: WorkspaceBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  )
}
