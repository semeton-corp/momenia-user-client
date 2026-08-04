"use client"

import { useEffect, useRef } from "react"

// The invitation renders at phone width even on desktop. CSS media queries measure the
// iframe's own viewport, so a full-width iframe would make the template lay itself out
// for desktop (sections side by side) and overflow the column it sits in. Below this
// width the iframe simply fills the screen, which is the real mobile case.
const PHONE_W = 420

type InvitationViewerProps = {
  html: string
  /** Wallpaper shown around the invitation on screens wider than the phone column. */
  background: string
}

export function InvitationViewer({ html, background }: InvitationViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // srcdoc is set imperatively rather than as a prop so React never re-parses this
  // (large) HTML string into the attribute on unrelated re-renders.
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !html) return
    iframe.setAttribute("srcdoc", html)
  }, [html])

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
        sandbox="allow-scripts allow-popups allow-forms"
        title="Invitation"
        className="h-full border-0 shadow-2xl"
        style={{ width: `min(${PHONE_W}px, 100vw)` }}
      />
    </div>
  )
}
