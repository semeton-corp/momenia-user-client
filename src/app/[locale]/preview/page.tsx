"use client"

import { useEffect, useRef, useSyncExternalStore } from "react"

const PREVIEW_STORAGE_KEY = "momenia_preview"

type PreviewState = {
  html: string
  userData: Record<string, string>
  theme: Record<string, string>
  activePage: string
}

function subscribe() {
  return () => {}
}

function getSnapshot() {
  return sessionStorage.getItem(PREVIEW_STORAGE_KEY)
}

function getServerSnapshot() {
  return null
}

export default function PreviewPage() {
  // sessionStorage is browser-only; useSyncExternalStore reads it without a hydration mismatch
  // (server snapshot is null, client swaps in the real value right after hydration).
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !raw) return

    let state: PreviewState
    try {
      state = JSON.parse(raw)
    } catch {
      return
    }

    // Mirror the inline editor preview exactly: load the base HTML into the iframe, then push
    // userData/theme via postMessage so images get set with `el.src = url` (a clean JS property
    // assignment) instead of being re-parsed from the srcDoc HTML — the latter can mangle the URL.
    const onLoad = () => {
      iframe.contentWindow?.postMessage(
        { type: "memoriaUpdate", userData: state.userData, theme: state.theme },
        "*"
      )
      iframe.contentWindow?.postMessage({ type: "memoriaGoTo", pageId: state.activePage }, "*")
    }
    iframe.addEventListener("load", onLoad, { once: true })
    iframe.setAttribute("srcdoc", state.html)
    return () => iframe.removeEventListener("load", onLoad)
  }, [raw])

  if (raw === null) {
    return <div className="flex h-screen items-center justify-center text-sm text-zinc-400">Loading preview...</div>
  }

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts allow-same-origin"
      title="Invitation Preview"
      className="h-screen w-screen border-0"
    />
  )
}
