"use client"

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react"
import { PREVIEW_STORAGE_KEY, type PreviewSnapshot } from "@/lib/invitation-preview"

// Phone-width viewport for the invitation. This has to stay under the template's
// 768px desktop breakpoint: CSS media queries measure the iframe's own viewport, so
// a full-width iframe makes the template lay itself out for desktop (sections side by
// side) and then get clipped by the column. The editor's preview is 375px for the same
// reason — keeping this narrow is what makes both previews agree.
const PHONE_W = 420

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

  const state = useMemo<PreviewSnapshot | null>(() => {
    if (!raw) return null
    try {
      return JSON.parse(raw) as PreviewSnapshot
    } catch {
      return null
    }
  }, [raw])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !state) return

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
  }, [state])

  if (raw === null) {
    return <div className="flex h-screen items-center justify-center text-sm text-zinc-400">Loading preview...</div>
  }

  // The wallpaper lives out here rather than inside the iframe, since the iframe is now
  // only as wide as the phone column and can no longer fill the screen behind it.
  const background = state?.theme?.backgroundImage || "/background-default-desktop.png"

  return (
    <div
      className="h-screen w-screen overflow-hidden bg-zinc-900"
      style={{
        backgroundImage: `url('${background}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts allow-same-origin"
        title="Invitation Preview"
        className="h-full border-0 shadow-2xl"
        style={{ width: `min(${PHONE_W}px, 100vw)` }}
      />
    </div>
  )
}
