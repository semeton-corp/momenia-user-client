"use client"

import { useEffect, useRef, useState } from "react"
import type { Invitation } from "@/lib/invitation/types"

interface Props {
  initialHtml: string
  invitation: Invitation
  mode?: "mobile" | "desktop"
  activePage?: string
}

export default function InvitationPreview({ initialHtml, invitation, mode = "mobile", activePage = "cover" }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [contentHeight, setContentHeight] = useState(760)
  const isLoadedRef = useRef(false)
  const invitationRef = useRef(invitation)
  invitationRef.current = invitation
  const activePageRef = useRef(activePage)
  activePageRef.current = activePage

  // Listen for height updates reported by the iframe runtime script
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "memoriaResize" && typeof e.data.height === "number") {
        setContentHeight(e.data.height)
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  // Set srcdoc once. After the iframe loads, flush the latest invitation data.
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !initialHtml) return

    isLoadedRef.current = false
    setContentHeight(812)

    const onLoad = () => {
      isLoadedRef.current = true
      iframe.contentWindow?.postMessage(
        { type: "memoriaUpdate", userData: invitationRef.current.userData, theme: invitationRef.current.theme },
        "*"
      )
      iframe.contentWindow?.postMessage({ type: "memoriaGoTo", pageId: activePageRef.current }, "*")
    }

    iframe.addEventListener("load", onLoad, { once: true })
    iframe.setAttribute("srcdoc", initialHtml)
    return () => iframe.removeEventListener("load", onLoad)
  }, [initialHtml])

  // Live updates: postMessage only — no reload, no blink
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !isLoadedRef.current) return
    iframe.contentWindow?.postMessage(
      {
        type: "memoriaUpdate",
        userData: invitation.userData,
        theme: invitation.theme,
      },
      "*"
    )
  }, [invitation.userData, invitation.theme])

  const iframeEl = (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts"
      style={{
        width: mode === "mobile" ? 375 : "100%",
        height: contentHeight,
        display: "block",
        border: 0,
      }}
      title="Invitation Preview"
    />
  )

  if (mode === "desktop") {
    return (
      <div className="w-full overflow-hidden rounded-xl shadow-2xl bg-white">
        {iframeEl}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative overflow-hidden shrink-0"
        style={{
          width: 391,
          borderRadius: "2.5rem",
          background: "#1a1a1a",
          border: "8px solid #111",
          outline: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
        }}
      >
        {/* Notch */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-10 rounded-b-xl"
          style={{ width: 120, height: 28, background: "#111" }}
        />
        {iframeEl}
      </div>
      <p className="text-xs text-gray-400 pb-4">Preview — 375px</p>
    </div>
  )
}
