import { cn } from "@/lib/utils"

type Props = {
  checked: boolean
  className?: string
}

export function RadioDot({ checked, className }: Props) {
  return (
    <div
      className={cn(
        "h-6 w-6 shrink-0 rounded-full transition-all",
        checked
          ? "bg-indigo-500 shadow-[0_0_0_3px_white]"
          : "bg-white shadow-inner",
        className
      )}
    />
  )
}
