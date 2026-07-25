import Image from "next/image"
import { PencilLine, Users } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { typography } from "@/lib/typography"

type InvitationPhonePreviewProps = {
  imageUrl: string
  title: string
  planName: string
  activeUntilLabel: string
  publishLabel: string
  publishedLabel: string
  notActiveWarning: string
  isPublished: boolean
  onPublish: () => void
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
  publishedLabel,
  notActiveWarning,
  isPublished,
  onPublish,
  editLabel,
  guestsLabel,
  editHref,
  guestsHref,
}: InvitationPhonePreviewProps) {
  return (
    <div className="flex flex-col xl:sticky xl:top-6">

      {/* Image — 264x564 fixed di mobile (rasio sama persis dengan 396/846) */}
      <div className="mx-auto w-[264px] sm:w-80 xl:mx-0 xl:w-[312px]">
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: "396 / 846", borderRadius: "14px" }}
        >
          <Image src={imageUrl} alt={title} fill className="object-cover" sizes="312px" />
        </div>
      </div>

      {/* Publish button — mt-4 = jarak dari gambar (mobile: 264x54 sesuai
          spec). Setelah dipublish, tombol jadi non-aktif (abu-abu) &
          teksnya berubah, tidak bisa diklik ulang. */}
      <div className="mx-auto mt-4 w-[264px] sm:w-80 xl:mx-0 xl:mt-6 xl:w-[312px]">
        <Button
          type="button"
          disabled={isPublished}
          onClick={onPublish}
          className={cn(
            `h-[54px] w-full rounded-[10px] ${typography.xl.semibold} xl:rounded-xl`,
            isPublished
              ? "bg-zinc-100 text-zinc-400 hover:bg-zinc-100"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {isPublished ? publishedLabel : publishLabel}
        </Button>
      </div>

      {/* Garis pembatas — full width, tebal 1px, warna var(--border) */}
      <div className="mt-4 h-px w-full xl:mt-6 xl:max-w-none" style={{ background: "var(--border)" }} />

      {/* Plan info — mt-6 = 24px dari garis pembatas */}
      <div className="xl:max-w-none xl:mt-6 mt-4">
        <p className={`${typography.base.medium}`} style={{ color: "var(--foreground)" }}>{planName}</p>

        {/* Desktop: titik status — merah + peringatan sebelum publish, biru + tanggal aktif sesudahnya */}
        <div className="mt-2 hidden items-start gap-2 xl:flex">
          <span
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
            style={{ background: isPublished ? "var(--primary)" : "#EF4444" }}
          />
          <span className={typography.sm.regular} style={{ color: "var(--foreground)" }}>
            {isPublished ? activeUntilLabel : notActiveWarning}
          </span>
        </div>

        {/* Mobile: plain text */}
        <p className="mt-0.5 text-xs text-zinc-500 xl:hidden">
          {isPublished ? activeUntilLabel : notActiveWarning}
        </p>
      </div>

      {/* Mobile: side-by-side outline buttons, border+teks indigo sesuai
          spec (versi desktop dipindah jadi kartu besar di
          InvitationDashboardClient, menggantikan bagian Template Pesan). */}
      <div className="mt-4 grid grid-cols-2 gap-3 xl:hidden">
        <Button asChild variant="outline" className="h-12 justify-center gap-3 rounded-[10px] border-primary px-3 text-sm font-normal text-primary hover:bg-primary/5 hover:text-primary">
          <Link href={editHref}>
            <PencilLine className="h-4 w-4" />
            {editLabel}
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12 justify-center gap-3 rounded-[10px] border-primary px-3 text-sm font-normal text-primary hover:bg-primary/5 hover:text-primary">
          <Link href={guestsHref}>
            <Users className="h-4 w-4" />
            {guestsLabel}
          </Link>
        </Button>
      </div>

    </div>
  )
}
