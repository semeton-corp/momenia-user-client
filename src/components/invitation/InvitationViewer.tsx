"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  confirmGuestInvitation,
  getGuestInvitationById,
} from "@/lib/api/guest-invitation/guest-invitation.service"
import {
  createGuestInvitationMessage,
  getPublicGuestInvitationMessages,
} from "@/lib/api/guest-message/guest-message.service"
import type { PublicGuestInvitationMessage } from "@/lib/api/guest-message/guest-message.types"
import { DESKTOP_CARD_WIDTH } from "@/lib/invitation-preview"
import LoadingScreen from "@/components/ui/loadingScreen"

// The backend returns 201 with an all-zero id (and empty fields) when the
// guestInvitationId doesn't exist, instead of 4xx — so status alone can't tell success
// from failure. Treat a zero id as a rejection until that's fixed server-side.
const ZERO_UUID = "00000000-0000-0000-0000-000000000000"

// Guest verification / guestbook can hang (dead network, backend hiccup) — after this
// long, reveal the invitation anyway rather than leaving the guest stuck on a spinner
// forever. The template's own "no-guest" fallback state is a fine outcome; an infinite
// loading screen is not.
const READY_TIMEOUT_MS = 8000

// Go's zero time, which the API still sends for messages that have no timestamp.
function isZeroDate(value: string): boolean {
  return !value || value.startsWith("0001-01-01")
}

// The API reports failures as a raw JSON body ({"error":…,"requestId":…}) and http()
// rethrows that whole string as the Error message. Printing it straight into the
// invitation would show a guest an English backend string and a requestId, so map the
// one case guests actually hit to real copy and let everything else fall back — an
// unrecognised error must never reach the page verbatim.
const ALREADY_SENT_CODE = "user already sent message"
const GENERIC_SUBMIT_ERROR = "Gagal mengirim pesan"

function toGuestFacingError(err: unknown): string {
  if (!(err instanceof Error)) return GENERIC_SUBMIT_ERROR
  // The duplicate-message rule is the only 409 the guest flow can produce; anything
  // else on another status is a genuine failure and gets the generic wording.
  if ((err as Error & { status?: number }).status !== 409) return GENERIC_SUBMIT_ERROR

  let code = err.message
  try {
    code = (JSON.parse(err.message) as { error?: string }).error ?? ""
  } catch {
    // Body wasn't JSON — compare the raw text instead.
  }

  return code === ALREADY_SENT_CODE
    ? "Gagal mengirim pesan, tamu hanya dapat mengirim 1 kali pesan"
    : GENERIC_SUBMIT_ERROR
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
  // Gates the reveal of the invitation, not the iframe's own loading — the iframe keeps
  // rendering underneath the whole time, so by the time this flips true its guest-specific
  // state (personalised name, RSVP hidden if already answered, guestbook filled) is already
  // applied. Without this the guest sees the generic "no-guest" state flash before it does.
  const [isReady, setIsReady] = useState(false)

  const post = useCallback((data: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(data, "*")
  }, [])

  const sendMessages = useCallback(
    (items: PublicGuestInvitationMessage[]) => {
      post({
        type: "memoriaMessages",
        // No isMessageHidden filter here: the guest-facing endpoint doesn't return that
        // flag because it has already withheld anything the owner hid.
        messages: items.map((m) => ({
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
      sendMessages(await getPublicGuestInvitationMessages(userInvitationId))
    } catch {
      // A guestbook that fails to load shouldn't break the invitation — the
      // template's own "empty" state stays visible.
    }
  }, [sendMessages, userInvitationId])

  // srcdoc is set imperatively rather than as a prop so React never re-parses this
  // (large) HTML string into the attribute on unrelated re-renders.
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !html) return
    let cancelled = false
    // Whichever settles first wins — a slow-but-successful fetch after the timeout has
    // already revealed the page shouldn't yank the loading screen back up.
    const timeoutId = setTimeout(() => { if (!cancelled) setIsReady(true) }, READY_TIMEOUT_MS)

    // Both requests start here, at mount, in parallel with the browser parsing the
    // iframe's (large) srcdoc document — not chained after the iframe's `load` event.
    // That previous ordering serialized two unrelated things: "wait for the DOM to
    // finish parsing" then "wait for the network," which made the loading screen sit
    // through both in sequence when they don't depend on each other at all. Only
    // *posting* the result into the iframe has to wait for `load` — you can't
    // postMessage into a document that hasn't loaded yet.
    //
    // Only report the guest id to the template once it's confirmed real — a link with
    // a garbage or revoked guestInvitationId should behave exactly like no id at all
    // (RSVP/guestbook hidden via the "no-guest" state), not show forms that are
    // guaranteed to fail on submit.
    const guestPromise = guestInvitationId
      ? getGuestInvitationById(guestInvitationId).catch(() => null)
      : Promise.resolve(null)
    const messagesPromise = getPublicGuestInvitationMessages(userInvitationId).catch(
      () => [] as PublicGuestInvitationMessage[],
    )

    const applyResults = async () => {
      const [guest, messages] = await Promise.all([guestPromise, messagesPromise])
      if (cancelled) return
      post({
        type: "memoriaGuest",
        guestInvitationId: guest ? guestInvitationId! : "",
        guestName: guest?.name ?? "",
        // Anything other than "not-confirmed" means this guest already answered,
        // which is what lets the template drop the RSVP form for them.
        guestStatus: guest?.status ?? "",
      })
      sendMessages(messages)
      if (!cancelled) {
        clearTimeout(timeoutId)
        setIsReady(true)
      }
    }

    const onLoad = () => { void applyResults() }

    iframe.addEventListener("load", onLoad, { once: true })
    iframe.setAttribute("srcdoc", html)
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      iframe.removeEventListener("load", onLoad)
    }
  }, [html, guestInvitationId, userInvitationId, post, sendMessages])

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
        fail(data.form === "message" ? toGuestFacingError(err) : "Gagal mengirim. Coba lagi.")
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
        // Kept mounted (not conditionally rendered) so it keeps loading behind the
        // LoadingScreen overlay instead of restarting once that overlay drops — inert
        // while hidden so a guest can't tab into or click through the pre-personalised
        // version underneath.
        aria-hidden={!isReady}
        inert={!isReady}
        className="h-full border-0 shadow-2xl"
        style={{ width: `min(${DESKTOP_CARD_WIDTH}px, 100vw)`, visibility: isReady ? "visible" : "hidden" }}
      />
      {!isReady && <LoadingScreen />}
    </div>
  )
}
