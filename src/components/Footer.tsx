"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

export function Footer() {
  // ── Semua hooks dideklarasikan di atas, berurutan ──
  const [zoomLevel, setZoomLevel] = React.useState(1)
  const [isDesktop, setIsDesktop] = React.useState(false)
  const scaleWrapperRef           = React.useRef<HTMLDivElement>(null)

  const t = useTranslations("footer")

  // Detect browser zoom via devicePixelRatio
  React.useEffect(() => {
    const update = () => setZoomLevel(globalThis.devicePixelRatio || 1)
    update()
    globalThis.addEventListener("resize", update)
    return () => globalThis.removeEventListener("resize", update)
  }, [])

  // Detect desktop breakpoint (lg = 1024px+)
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // Hitung scale — HANYA aktif di desktop:
  // 100% → 1.00 | 110% → 0.93 | 125% → 0.86 | 150% → 0.75
  const zoomScale = React.useMemo(() => {
    const z        = Number.isFinite(zoomLevel) ? zoomLevel : 1
    const clamped  = Math.min(1.5, Math.max(1, z))
    const progress = (clamped - 1) / 0.5
    const scale    = 1 - progress * 0.25
    return Math.round(scale * 1000) / 1000
  }, [zoomLevel])

  const activeScale = isDesktop ? zoomScale : 1

  // Kompensasi gap di bawah akibat scale() transform
  React.useEffect(() => {
    const el = scaleWrapperRef.current
    if (!el) return
    const naturalHeight   = el.scrollHeight
    const compensation    = (activeScale - 1) * naturalHeight
    el.style.transition   = "margin-bottom 200ms ease-out"
    el.style.marginBottom = `${compensation}px`
  }, [activeScale])

  return (
    <footer className="w-full bg-[var(--chart-5)] py-8 md:py-10" aria-label="Footer">
      {/* Wrapper yang di-scale — hanya di desktop, smooth saat zoom */}
      <div
        ref={scaleWrapperRef}
        style={{
          transform:       `scale(${activeScale})`,
          transformOrigin: "top center",
          transition:      "transform 200ms ease-out",
          willChange:      "transform",
        }}
      >
        <div className="mx-auto w-full max-w-[1600px] px-4 md:px-12">
          <p
            className="text-center text-sm font-semibold text-white/90 md:text-base"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  )
}