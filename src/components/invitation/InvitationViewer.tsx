"use client"

import { useCallback, useEffect, useRef } from "react"
import {
  confirmGuestInvitation,
  getGuestInvitationById,
} from "@/lib/api/guest-invitation/guest-invitation.service"
import {
  createGuestInvitationMessage,
  getGuestInvitationMessages,
} from "@/lib/api/guest-message/guest-message.service"
import type { GuestInvitationMessage } from "@/lib/api/guest-message/guest-message.types"

// The invitation renders at phone width even on desktop. CSS media queries measure the
// iframe's own viewport, so a full-width iframe would make the template lay itself out
// for desktop (sections side by side) and overflow the column it sits in. Below this
// width the iframe simply fills the screen, which is the real mobile case.
const PHONE_W = 420

// The backend returns 201 with an all-zero id (and empty fields) when the
// guestInvitationId doesn't exist, instead of 4xx — so status alone can't tell success
// from failure. Treat a zero id as a rejection until that's fixed server-side.
const ZERO_UUID = "00000000-0000-0000-0000-000000000000"

// Go's zero time, which the API still sends for messages that have no timestamp.
function isZeroDate(value: string): boolean {
  return !value || value.startsWith("0001-01-01")
}

// Matches Go's default time.Time string ("2006-01-02 15:04:05.999999999 -0700 MST")
// and RFC3339 ("2006-01-02T15:04:05-07:00") — the API has sent both shapes for
// different endpoints. The trailing zone name/abbreviation ("UTC", "+07", "WIB", …)
// is ignored; the numeric offset it's paired with already carries that information.
const GO_TIME_RE = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?\s*([+-]\d{2}):?(\d{2})/

// The API sends a raw Go-formatted timestamp with no locale or timezone conversion —
// this turns it into something readable in the GUEST's own timezone (Intl reads that
// from the browser), so someone in Jakarta and someone in Bali each see their local
// time, not the server's.
function formatMessageTimestamp(raw: string, locale: string): string {
  const match = GO_TIME_RE.exec(raw)
  if (!match) return ""
  const [, y, mo, d, h, mi, s, frac, offH, offM] = match
  const ms = (frac ?? "").padEnd(3, "0").slice(0, 3)
  const date = new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}.${ms}${offH}:${offM}`)
  if (Number.isNaN(date.getTime())) return ""

  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

type SubmitMessage = {
  type: "memoriaSubmit"
  form: "message" | "rsvp"
  payload: { message?: string; status?: string; totalAttendee?: number }
}

type InvitationViewerProps = {
  html: string
  /** Wallpaper shown around the invitation on screens wider than the phone column. */
  background: string
  /** Invitation this page belongs to — used to load the guestbook. */
  userInvitationId: string
  /** From ?guestInvitationId=… — absent when the link isn't personalised. */
  guestInvitationId?: string
  /** Locale of the page the guest is viewing — controls guestbook timestamp formatting. */
  locale: string
}

export function InvitationViewer({
  html,
  background,
  userInvitationId,
  guestInvitationId,
  locale,
}: InvitationViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const post = useCallback((data: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(data, "*")
  }, [])

  const sendMessages = useCallback(
    (items: GuestInvitationMessage[]) => {
      post({
        type: "memoriaMessages",
        messages: items
          .filter((m) => !m.isMessageHidden)
          .map((m) => ({
            name: m.name,
            message: m.message,
            messageAt: isZeroDate(m.messageAt) ? "" : formatMessageTimestamp(m.messageAt, locale),
          })),
      })
    },
    [post, locale],
  )

  const refreshMessages = useCallback(async () => {
    try {
      sendMessages(await getGuestInvitationMessages(userInvitationId))
    } catch {
      // A guestbook that fails to load shouldn't break the invitation — the
      // template's own "empty" state stays visible.
    }
  }, [sendMessages, userInvitationId])

  // srcdoc is set imperatively rather than as a prop so React never re-parses this
  // (large) HTML string into the attribute on unrelated re-renders. Once the document
  // is up, tell it who is viewing and fill the guestbook.
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !html) return
    let cancelled = false

    const onLoad = () => {
      void (async () => {
        // Only report the id to the template once it's confirmed real — a link with a
        // garbage or revoked guestInvitationId should behave exactly like no id at all
        // (RSVP/guestbook hidden via the "no-guest" state), not show forms that are
        // guaranteed to fail on submit.
        let verifiedGuestId = ""
        let guestName = ""
        if (guestInvitationId) {
          try {
            guestName = (await getGuestInvitationById(guestInvitationId)).name
            verifiedGuestId = guestInvitationId
          } catch {
            // Unknown or revoked id — the template falls back to "no-guest".
          }
        }
        if (cancelled) return
        post({ type: "memoriaGuest", guestInvitationId: verifiedGuestId, guestName })
        await refreshMessages()
      })()
    }

    iframe.addEventListener("load", onLoad, { once: true })
    iframe.setAttribute("srcdoc", html)
    return () => {
      cancelled = true
      iframe.removeEventListener("load", onLoad)
    }
  }, [html, guestInvitationId, post, refreshMessages])

  // Handle submits relayed up from the template's data-momenia-form elements.
  useEffect(() => {
    const handler = async (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return
      const data = e.data as SubmitMessage | undefined
      if (data?.type !== "memoriaSubmit") return

      const fail = (error: string) =>
        post({ type: "memoriaFormResult", form: data.form, ok: false, error })

      if (!guestInvitationId) {
        fail("Tautan undangan ini tidak memuat identitas tamu.")
        return
      }

      try {
        if (data.form === "message") {
          const created = await createGuestInvitationMessage({
            guestInvitationId,
            message: data.payload.message ?? "",
          })
          if (!created?.id || created.id === ZERO_UUID) {
            fail("Tamu tidak dikenali. Periksa kembali tautan undanganmu.")
            return
          }
          post({ type: "memoriaFormResult", form: "message", ok: true })
          await refreshMessages()
          return
        }

        const status = data.payload.status === "absent" ? "absent" : "present"
        await confirmGuestInvitation(guestInvitationId, {
          status,
          totalAttendee: status === "absent" ? 0 : Math.max(1, data.payload.totalAttendee ?? 1),
        })
        post({ type: "memoriaFormResult", form: "rsvp", ok: true })
      } catch (err) {
        fail(err instanceof Error && err.message ? err.message : "Gagal mengirim. Coba lagi.")
      }
    }

    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [guestInvitationId, post, refreshMessages])

  return (
    // Left-aligned on desktop (matching the editor preview), so the wallpaper fills
    // the space to the right rather than being split either side.
    <div
      className="flex h-dvh w-screen overflow-hidden bg-zinc-900"
      style={{
        backgroundImage: `url('${background}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <iframe
        ref={iframeRef}
        // No allow-same-origin: the invitation's own script only needs to run and
        // postMessage, and withholding it keeps the template sandboxed from this origin.
        // allow-popups-to-escape-sandbox matters specifically for the map: Google's own
        // "Buka di Maps" link lives inside the embedded maps.google.com iframe, and without
        // this flag the tab it opens inherits our sandbox restrictions too — Google then
        // refuses to render in that restricted context (ERR_BLOCKED_BY_RESPONSE).
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms"
        title="Invitation"
        className="h-full border-0 shadow-2xl"
        style={{ width: `min(${PHONE_W}px, 100vw)` }}
      />
    </div>
  )
}
