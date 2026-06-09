import Image from "next/image"
import { PencilLine, UsersRound } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"

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
    <div className="flex flex-col gap-4 xl:sticky xl:top-6">

      {/* Image + Publish: centered on mobile, natural on desktop */}
      <div className="mx-auto flex w-full max-w-72 flex-col gap-4 sm:max-w-80 xl:mx-0 xl:max-w-85">
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: "396 / 846", borderRadius: "14px" }}
        >
          <Image src={imageUrl} alt={title} fill className="object-cover" sizes="340px" />
        </div>
        <Button className="h-12 w-full rounded-xl text-sm font-semibold">
          {publishLabel}
        </Button>
      </div>

      {/* Desktop separator */}
      <hr className="hidden border-zinc-200 xl:block" />

      {/* Plan info — left-aligned on both */}
      <div className="xl:max-w-85">
        <p className="text-sm font-semibold text-zinc-900">{planName}</p>

        {/* Desktop: with toggle */}
        <div className="mt-2 hidden items-center gap-2 xl:flex">
          <div className="relative h-5 w-9 shrink-0 rounded-full bg-zinc-300">
            <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow" />
          </div>
          <span className="text-xs text-zinc-500">{activeUntilLabel}</span>
        </div>

        {/* Mobile: plain text */}
        <p className="mt-0.5 text-xs text-zinc-500 xl:hidden">{activeUntilLabel}</p>
      </div>

      {/* Desktop: stacked filled buttons */}
      <div className="hidden flex-col gap-3 xl:flex xl:max-w-85">
        <Button asChild className="h-12 justify-start gap-3 rounded-xl px-4 text-sm font-medium">
          <Link href={editHref}>
            <PencilLine className="h-4 w-4" />
            {editLabel}
          </Link>
        </Button>
        <Button asChild className="h-12 justify-start gap-3 rounded-xl px-4 text-sm font-medium">
          <Link href={guestsHref}>
            <UsersRound className="h-4 w-4" />
            {guestsLabel}
          </Link>
        </Button>
      </div>

      {/* Mobile: side-by-side outline buttons — left-aligned, full width */}
      <div className="grid grid-cols-2 gap-3 xl:hidden">
        <Button asChild variant="outline" className="h-12 justify-center gap-2 rounded-xl px-3 text-sm font-medium">
          <Link href={editHref}>
            <PencilLine className="h-4 w-4" />
            {editLabel}
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12 justify-center gap-2 rounded-xl px-3 text-sm font-medium">
          <Link href={guestsHref}>
            <UsersRound className="h-4 w-4" />
            {guestsLabel}
          </Link>
        </Button>
      </div>

    </div>
  )
}
