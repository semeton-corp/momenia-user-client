"use client"

import * as React from "react"

export function useZoomScale(): number {
  const [zoomLevel, setZoomLevel] = React.useState(1)
  const [isDesktop, setIsDesktop] = React.useState(false)

  React.useEffect(() => {
    const update = () => setZoomLevel(globalThis.devicePixelRatio || 1)
    update()
    globalThis.addEventListener("resize", update)
    return () => globalThis.removeEventListener("resize", update)
  }, [])

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return React.useMemo(() => {
    if (!isDesktop) return 1
    const z = Number.isFinite(zoomLevel) ? zoomLevel : 1
    const clamped = Math.min(1.5, Math.max(1, z))
    const progress = (clamped - 1) / 0.5
    return Math.round((1 - progress * 0.25) * 1000) / 1000
  }, [zoomLevel, isDesktop])
}
