import { cn } from "@/lib/utils"

type StyleTagProps = {
  label: string
  active?: boolean
  onClick?: () => void
}

export function StyleTag({ label, active, onClick }: StyleTagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-5 py-2 text-base font-medium transition-colors",
        active
          ? "border-primary bg-primary text-white"
          : "border-zinc-200 bg-white text-zinc-600 hover:border-primary hover:text-primary"
      )}
    >
      {label}
    </button>
  )
}
