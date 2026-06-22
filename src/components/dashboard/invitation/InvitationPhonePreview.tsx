import Image from "next/image"
import { PencilLine, Users } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { typography } from "@/lib/typography"

type InvitationPhonePreviewProps = {
  imageUrl: string
  title: string
  planName: string
  activeUntilLabel: string
  publishLabel: string
  editLabel: string
  guestsLabel: string
  editHref: string
  guestsHref: string
}

export function InvitationPhonePreview({
  imageUrl,
  title,
  planName,
  activeUntilLabel,
  publishLabel,
  editLabel,
  guestsLabel,
  editHref,
  guestsHref,
}: InvitationPhonePreviewProps) {
  return (
    <div className="flex flex-col xl:sticky xl:top-6">

      {/* Image */}
      <div className="mx-auto w-full max-w-72 sm:max-w-80 xl:mx-0 xl:max-w-[396px]">
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: "396 / 846", borderRadius: "14px" }}
        >
          <Image src={imageUrl} alt={title} fill className="object-cover" sizes="340px" />
        </div>
      </div>

      {/* Publish button — mt-6 = 24px dari gambar */}
      <div className="mx-auto w-full max-w-72 sm:max-w-80 xl:mx-0 xl:max-w-[396px] xl:mt-6">
        <Button
          className={`w-full rounded-xl p-4 ${typography.xl.semibold} xl:h-[54px] xl:rounded-xl xl:p-4`}
          style={{ background: "var(--primary)", color: "var(--popover)" }}
        >
          {publishLabel}
        </Button>
      </div>

      {/* Plan info — mt-12 = 48px dari publish button */}
      <div className="xl:max-w-none xl:mt-12 mt-4">
        <p className={`${typography.base.medium}`} style={{ color: "var(--foreground)" }}>{planName}</p>

        {/* Desktop: with toggle */}
        <div className="mt-2 hidden items-center gap-2 xl:flex">
          <div className="relative h-5 w-9 shrink-0 rounded-full bg-zinc-300">
            <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow" />
          </div>
          <span className={typography.sm.regular} style={{ color: "var(--foreground)" }}>{activeUntilLabel}</span>
        </div>

        {/* Mobile: plain text */}
        <p className="mt-0.5 text-xs text-zinc-500 xl:hidden">{activeUntilLabel}</p>
      </div>

      {/* Desktop: stacked filled buttons — mt-6 = 24px dari plan info */}
      <div className="hidden flex-col xl:flex xl:max-w-none xl:mt-6 xl:gap-3">
        <Button asChild className={`w-full justify-start gap-3 p-4 ${typography.xl.semibold} xl:h-16 xl:p-4`} style={{ borderRadius: "14px", color: "var(--popover)" }}>
          <Link href={editHref}>
            <PencilLine className="h-8 w-8" />
            {editLabel}
          </Link>
        </Button>
        {/* gap-3 = 12px antara edit template dan kelola tamu */}
        <Button asChild className={`w-full justify-start gap-3 p-4 ${typography.xl.semibold} xl:h-16 xl:p-4`} style={{ borderRadius: "14px", color: "var(--popover)" }}>
          <Link href={guestsHref}>
            <Users className="h-8 w-8" />
            {guestsLabel}
          </Link>
        </Button>
      </div>

      {/* Mobile: side-by-side outline buttons */}
      <div className="grid grid-cols-2 gap-3 xl:hidden">
        <Button asChild variant="outline" className="h-12 justify-center gap-2 rounded-xl px-3 text-sm font-medium">
          <Link href={editHref}>
            <PencilLine className="h-4 w-4" />
            {editLabel}
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12 justify-center gap-2 rounded-xl px-3 text-sm font-medium">
          <Link href={guestsHref}>
            <Users className="h-4 w-4" />
            {guestsLabel}
          </Link>
        </Button>
      </div>

    </div>
  )
}
