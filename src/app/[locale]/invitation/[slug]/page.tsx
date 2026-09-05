import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { getUserInvitationContent } from "@/lib/api/user-invitation/user-invitation.service"
import type { UserInvitationContent } from "@/lib/api/user-invitation/user-invitation.types"
import { InvitationPageClient } from "./InvitationPageClient"

// Guests must always see the couple's latest published content, so this is never
// served from a cached render.
export const dynamic = "force-dynamic"

type Props = {
  readonly params: Promise<{ locale: string; slug: string }>
  readonly searchParams: Promise<{ guestInvitationId?: string }>
}

async function fetchInvitation(slug: string): Promise<UserInvitationContent | null> {
  try {
    return await getUserInvitationContent(slug)
  } catch {
    // Unknown slug, unpublished, or the API is unreachable — all render as "not found"
    // rather than an error page, since a guest can't act on the difference.
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const invitation = await fetchInvitation(slug)
  if (!invitation) return { title: "Momenia" }

  // Invitation links get shared in chat apps, so the couple's names carry the preview.
  const headline = invitation.fieldValues.headline?.trim()
  const title = headline ? `${headline} — Undangan` : "Undangan"
  const cover = invitation.fieldValues.couple_photo

  return {
    title,
    openGraph: {
      title,
      images: cover ? [cover] : undefined,
    },
  }
}

// The actual fetch + music resolution happens client-side (InvitationPageClient) — see
// the comment there for why: resolving fieldValues.background_music_id without the
// backend's real `music` embed needs localStorage, which only exists in the browser.
export default async function InvitationPage({ params, searchParams }: Props) {
  const { locale, slug } = await params
  const { guestInvitationId } = await searchParams
  setRequestLocale(locale)

  return <InvitationPageClient locale={locale} slug={slug} guestInvitationId={guestInvitationId} />
}
