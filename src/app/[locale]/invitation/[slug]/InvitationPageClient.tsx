"use client"

import { useEffect, useState } from "react"
import { InvitationViewer } from "@/components/invitation/InvitationViewer"
import { getUserInvitationContent } from "@/lib/api/user-invitation/user-invitation.service"
import { buildInvitationHtml, DEFAULT_DESKTOP_BACKGROUND, DESKTOP_BACKGROUND_FIELD_KEY } from "@/lib/invitation-preview"
import { getMusicById } from "@/lib/api/music/music.service"
import type { UserInvitationContent } from "@/lib/api/user-invitation/user-invitation.types"

type Props = {
  locale: string
  slug: string
  guestInvitationId?: string
}

// STAND-IN, not the real fix: the backend doesn't embed a resolved `music` object into
// the public content response yet, so this resolves fieldValues.background_music_id
// itself via GET /musics/:id. That endpoint requires a Bearer token a real anonymous
// guest never has (confirmed: 401 "authorization header empty" with none) — so this only
// ever plays music in a browser that happens to already hold a logged-in dashboard
// session (e.g. the couple previewing their own link). Real guests silently get no
// music, same as before, until the backend adds the real embed. This also has to be a
// Client Component (not the previous Server Component) for that same reason — resolving
// anything here needs localStorage, which only exists in the browser.
export function InvitationPageClient({ locale, slug, guestInvitationId }: Props) {
  const [invitation, setInvitation] = useState<UserInvitationContent | null>(null)
  const [musicUrl, setMusicUrl] = useState<string | undefined>(undefined)
  const [status, setStatus] = useState<"loading" | "ready" | "not-found">("loading")

  useEffect(() => {
    let cancelled = false
    getUserInvitationContent(slug)
      .then((data) => {
        if (cancelled) return
        setInvitation(data)
        setStatus("ready")

        const musicId = data.music?.musicUrl ? undefined : data.fieldValues.background_music_id
        if (!musicId) return
        getMusicById(musicId)
          .then((track) => { if (!cancelled) setMusicUrl(track.musicUrl) })
          .catch(() => {
            // No/invalid session in this browser — exactly what a real guest sees,
            // so this just falls back to no music rather than erroring.
          })
      })
      .catch(() => {
        // Unknown slug, unpublished, or the API is unreachable — all render as
        // "not found" rather than an error page, same as the server version did.
        if (!cancelled) setStatus("not-found")
      })
    return () => { cancelled = true }
  }, [slug])

  if (status === "not-found") {
    return <div className="flex h-dvh items-center justify-center text-sm text-zinc-400">Undangan tidak ditemukan.</div>
  }

  if (status === "loading" || !invitation) {
    return <div className="flex h-dvh items-center justify-center text-sm text-zinc-400">Loading...</div>
  }

  const { template, fieldValues } = invitation
  const mainSections = template.pages.find((p) => p.id === "main")?.sections ?? []

  const html = buildInvitationHtml(
    invitation,
    fieldValues,
    template.theme_defaults,
    mainSections.map((s) => s.id),
    locale,
    invitation.music?.musicUrl ?? musicUrl,
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
