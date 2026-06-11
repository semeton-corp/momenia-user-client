"use client"

import * as React from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import Ambient from "@/assets/llandingpage/banner-create-now.svg"

export function CreateNowBanner() {
  const router = useRouter()
  // ── Semua hooks dideklarasikan di atas, berurutan ──
  const [zoomLevel, setZoomLevel] = React.useState(1)
  const [isDesktop, setIsDesktop] = React.useState(false)
  const scaleWrapperRef           = React.useRef<HTMLDivElement>(null)

  const t = useTranslations("landing.createNow")

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

  // Kompensasi gap di bawah section akibat scale() transform
  React.useEffect(() => {
    const el = scaleWrapperRef.current
    if (!el) return
    const naturalHeight   = el.scrollHeight
    const compensation    = (activeScale - 1) * naturalHeight
    el.style.transition   = "margin-bottom 200ms ease-out"
    el.style.marginBottom = `${compensation}px`
  }, [activeScale])

  return (
    <section className="w-full pt-10 pb-14 md:pt-14 md:pb-20 lg:pt-16 lg:pb-24" aria-label="Create Now">
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
        <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6">
          <div
            className="relative mx-auto flex w-full items-center justify-center overflow-hidden rounded-[24px] h-32 md:h-40 md:rounded-[32px] lg:h-64 lg:rounded-[40px]"
            style={{
              background:
                "linear-gradient(to top, #312E81 0%, #4F46E5 27%, #6366F1 44%, #A5B4FC 74%, #DDD6FE 100%)",
            }}
          >
            {/* Bagian Kiri */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[40%] opacity-70 md:w-[30%] lg:w-[25%]">
              <Image
                src={Ambient}
                alt="ambient"
                fill
                className="object-contain object-right-bottom scale-x-[-1]"
                priority
              />
            </div>

            {/* Bagian Kanan */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-[40%] opacity-70 md:w-[30%] lg:w-[25%]">
              <Image
                src={Ambient}
                alt="ambient"
                fill
                className="object-contain object-right-bottom"
                priority
              />
            </div>

            {/* Konten Text */}
            <div
              className="relative z-10 mx-auto w-full max-w-3xl px-4 text-center text-white"
              style={{ fontFamily: "var(--font-geist-sans)" }}
            >
              <h3 className="font-semibold text-2xl md:text-4xl lg:text-6xl">{t("title")}</h3>

              <p className="mt-1 text-xs font-normal md:mt-2 md:text-sm lg:text-lg">
                {t("subtitle1")}
              </p>
              <p className="text-xs font-normal md:text-sm lg:text-lg">{t("subtitle2")}</p>

              <button
                onClick={() => router.push("/dashboard")}
                className="mt-2 md:mt-4 inline-flex items-center justify-center rounded-md bg-white/90 shadow hover:bg-white text-[#4F46E5] font-medium h-8 px-4 text-xs md:h-10 md:px-6 md:text-sm"
                type="button"
              >
                {t("cta")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}