import { cn } from "@/lib/utils"

type Props = {
  checked: boolean
  className?: string
}

export function CheckboxTile({ checked, className }: Props) {
  return (
    <div
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-all",
        checked ? "bg-indigo-500" : "bg-white border border-zinc-300",
        className
      )}
    >
      {checked && (
        <svg className="h-4 w-4 text-white" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 8.5l3.5 3.5 6.5-7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  )
}
