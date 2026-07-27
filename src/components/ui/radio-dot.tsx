import { cn } from "@/lib/utils"

type Props = {
  checked: boolean
  className?: string
}

export function RadioDot({ checked, className }: Props) {
  return (
    <div
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-all",
        checked ? "border-indigo-600" : "border-zinc-300",
        className
      )}
    >
      {checked && <div className="h-3 w-3 rounded-full bg-indigo-600" />}
    </div>
  )
}
