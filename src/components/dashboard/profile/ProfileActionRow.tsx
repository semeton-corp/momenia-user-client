import type { LucideIcon } from "lucide-react"
import { ChevronRight } from "lucide-react"

type ProfileActionRowProps = {
  icon: LucideIcon
  label: string
  value: string
  href?: string
  onClick?: () => void
  ariaExpanded?: boolean
}

// Baris aksi profil (Preference/Support) — beda dari ProfileInfoRow yang read-only:
// ini bisa ditekan (buka link atau dropdown) dan punya chevron di kanan.
export function ProfileActionRow({ icon: Icon, label, value, href, onClick, ariaExpanded }: ProfileActionRowProps) {
  const className =
    "flex w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/40 xl:px-6 xl:py-5"

  const content = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-primary xl:h-[42px] xl:w-[42px]">
        <Icon className="h-4 w-4 xl:h-5 xl:w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-normal text-muted-foreground xl:text-sm">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-popover-foreground xl:text-base">{value}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-zinc-400" />
    </>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick} aria-expanded={ariaExpanded} className={className}>
      {content}
    </button>
  )
}
