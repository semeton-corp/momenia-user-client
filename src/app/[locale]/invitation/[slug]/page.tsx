import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { InvitationViewer } from "@/components/invitation/InvitationViewer"
import { getUserInvitationContent } from "@/lib/api/user-invitation/user-invitation.service"
import { buildInvitationHtml, DEFAULT_DESKTOP_BACKGROUND, DESKTOP_BACKGROUND_FIELD_KEY } from "@/lib/invitation-preview"
import type { UserInvitationContent } from "@/lib/api/user-invitation/user-invitation.types"

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

export default async function InvitationPage({ params, searchParams }: Props) {
  const { locale, slug } = await params
  const { guestInvitationId } = await searchParams
  setRequestLocale(locale)

  const invitation = await fetchInvitation(slug)
  if (!invitation) notFound()

  const { template, fieldValues } = invitation
  const mainSections = template.pages.find((p) => p.id === "main")?.sections ?? []

  const html = buildInvitationHtml(
    invitation,
    fieldValues,
    template.theme_defaults,
    mainSections.map((s) => s.id),
  )

  return (
    <InvitationViewer
      html={html}
      background={fieldValues[DESKTOP_BACKGROUND_FIELD_KEY] || DEFAULT_DESKTOP_BACKGROUND}
      userInvitationId={invitation.id}
      guestInvitationId={guestInvitationId}
      locale={locale}
    />
  )
}
