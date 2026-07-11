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
        "inline-flex h-[35px] shrink-0 cursor-pointer items-center justify-center rounded-[30px] border px-6 text-sm font-medium leading-none transition-colors sm:text-base",
        active
          ? "border-primary bg-primary text-white"
          : "border-indigo-300 bg-indigo-50 text-black hover:border-primary hover:bg-primary hover:text-white"
      )}
    >
      {label}
    </button>
  )
}
