import type { ComponentType } from "react"
import { ArrowRight } from "lucide-react"
import { Link } from "@/i18n/navigation"

type WorkspaceActionCardProps = {
  href: string
  /** Ikon utama di kotak kaca 64×64 */
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  /** Badge lingkaran, menempel di kanan-atas */
  topBadgeIcon: ComponentType<{ className?: string }>
  /** Badge kotak, menempel di kiri-bawah */
  bottomBadgeIcon: ComponentType<{ className?: string }>
  title: string
  subtitle: string
}

// Kartu aksi besar (bg indigo, ikon kaca 3-lapis + judul/subjudul + tombol
// panah dengan cincin riak dekoratif) — dipakai untuk "Edit Template"/
// "Kelola Tamu" di overview workspace.
export function WorkspaceActionCard({
  href,
  icon: Icon,
  topBadgeIcon: TopBadgeIcon,
  bottomBadgeIcon: BottomBadgeIcon,
  title,
  subtitle,
}: WorkspaceActionCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex h-[110px] w-full items-center gap-5 overflow-hidden rounded-[14px] bg-primary px-6 shadow-lg transition-colors hover:bg-primary/90 xl:h-[140px]"
    >
      {/* Ikon kaca 3-lapis: kartu miring dekoratif di belakang + kotak utama
          64×64 (persis spec) + badge lingkaran kanan-atas + badge kotak
          kiri-bawah. */}
      <div className="relative h-[76px] w-[76px] shrink-0">
        {/* Kartu dekoratif miring di belakang, kasih efek "bertumpuk" — arah
            rotasi dibalik (-rotate-6) supaya rapi mengikuti referensi. */}
        <div className="absolute left-1.5 top-0 h-16 w-16 -rotate-6 rounded-2xl border border-white/20 bg-white/10" aria-hidden="true" />

        {/* Kotak ikon utama — 64×64, bg white/15, stroke putih 10%, shadow-lg, radius 16px */}
        <div className="absolute left-1.5 top-0 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/15 shadow-lg">
          <Icon className="h-7 w-7 text-white" strokeWidth={2} />
        </div>

        {/* Badge lingkaran — kanan-atas. Fill indigo-500, stroke putih 0.67px opacity 10%, ikon 14×14 */}
        <div className="absolute -top-1 right-0 flex h-6 w-6 items-center justify-center rounded-full border-[0.67px] border-white/10 bg-indigo-500 shadow-md">
          <TopBadgeIcon className="h-3.5 w-3.5 text-white" />
        </div>

        {/* Badge kotak — kiri-bawah. rounded-md (bukan rounded-xl) supaya lengkungannya
            tidak sampai jadi lingkaran penuh. Fill indigo-500, stroke putih 0.67px opacity 10%, ikon 14×14 */}
        <div className="absolute -bottom-1 left-0 flex h-6 w-6 items-center justify-center rounded-md border-[0.67px] border-white/10 bg-indigo-500 shadow-md">
          <BottomBadgeIcon className="h-3.5 w-3.5 text-white" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-base font-bold text-white xl:text-lg">{title}</p>
        <p className="mt-1 truncate text-xs text-white xl:text-sm">{subtitle}</p>
      </div>

      {/* Tombol panah + cincin riak dekoratif */}
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center xl:h-10 xl:w-10">
        <span className="absolute inset-0 rounded-full border border-white/15" aria-hidden="true" />
        <span className="absolute -inset-3 rounded-full border border-white/10" aria-hidden="true" />
        <span className="absolute -inset-6 rounded-full border border-white/[0.06]" aria-hidden="true" />
        <span className="absolute -inset-9 rounded-full border border-white/[0.04]" aria-hidden="true" />
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white/15 text-white transition-transform group-hover:translate-x-0.5">
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  )
}
