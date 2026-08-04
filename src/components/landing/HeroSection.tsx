"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion"
import { useTranslations } from "next-intl"
import MainDashboardPreview from "@/assets/llandingpage/main-dashboard-preview.svg"
import StatsPreview from "@/assets/llandingpage/stats-preview.svg"
import GuestManagementPreview from "@/assets/llandingpage/guest-management-preview.svg"
import FrontEnvelope from "@/assets/llandingpage/front-envelope.svg"
import PromoFrontEnvelope from "@/assets/llandingpage/promotion-front-envelope.svg"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { useCurrentUser } from "@/hooks/auth/useCurrentUser"

type PromoContent = {
  readonly badge: string
  readonly title: string
  readonly subtitle: string
}

type HeroSectionProps = {
  readonly promoContent?: PromoContent
}

export function HeroSection({ promoContent }: HeroSectionProps = {}) {
  const [parallaxDistance, setParallaxDistance] = React.useState(0)
  const [zoomLevel, setZoomLevel] = React.useState(1)
  const [isDesktop, setIsDesktop] = React.useState(false)
  const [isParallaxReady, setIsParallaxReady] = React.useState(false)

  const scaleWrapperRef = React.useRef<HTMLDivElement>(null)
  const heroRef = React.useRef<HTMLDivElement>(null)

  const t = useTranslations("landing.hero")
  const reduceMotion = useReducedMotion()
  const { isLoggedIn } = useCurrentUser()
  const ctaHref = isLoggedIn ? "/dashboard" : "/login"

  const frontEnvelopeClipPath = promoContent
    ? "polygon(0 0%, 48.8% 56.8%, 51.2% 56.8%, 100% 0%, 100% 100%, 0 100%)"
    : "polygon(0 0%, 48.8% 69.2%, 51.2% 69.2%, 100% 0%, 100% 100%, 0 100%)"
  const envelopeOffsetClass = "bottom-0 md:-bottom-6 lg:-bottom-14"
  const envelopeSrc = promoContent ? PromoFrontEnvelope : FrontEnvelope
  const premiumEase = [0.22, 1, 0.36, 1] as [number, number, number, number]

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  })

  React.useEffect(() => {
    const update = () => {
      if (globalThis.innerWidth < 768) setParallaxDistance(80)
      else if (globalThis.innerWidth < 1024) setParallaxDistance(150)
      else setParallaxDistance(250)
    }

    update()
    globalThis.addEventListener("resize", update)
    return () => globalThis.removeEventListener("resize", update)
  }, [])

  React.useEffect(() => {
    const update = () => setZoomLevel(globalThis.devicePixelRatio || 1)

    update()
    globalThis.addEventListener("resize", update)
    return () => globalThis.removeEventListener("resize", update)
  }, [])

  React.useEffect(() => {
    const mq = globalThis.matchMedia("(min-width: 1024px)")
    setIsDesktop(mq.matches)

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  React.useEffect(() => {
    let frameA = 0
    let frameB = 0

    frameA = globalThis.requestAnimationFrame(() => {
      frameB = globalThis.requestAnimationFrame(() => {
        setIsParallaxReady(true)
      })
    })

    return () => {
      globalThis.cancelAnimationFrame(frameA)
      globalThis.cancelAnimationFrame(frameB)
    }
  }, [])

  const zoomScale = React.useMemo(() => {
    const z = Number.isFinite(zoomLevel) ? zoomLevel : 1
    const clamped = Math.min(1.5, Math.max(1, z))
    const progress = (clamped - 1) / 0.5
    const scale = 1 - progress * 0.25
    return Math.round(scale * 1000) / 1000
  }, [zoomLevel])

  const activeScale = isDesktop ? zoomScale : 1

  React.useEffect(() => {
    const el = scaleWrapperRef.current
    if (!el) return

    const naturalHeight = el.scrollHeight
    const compensation = (activeScale - 1) * naturalHeight

    el.style.transition = "margin-bottom 200ms ease-out"
    el.style.marginBottom = `${compensation}px`
  }, [activeScale])

  const statsYBase = useTransform(scrollYProgress, [0, 1], [0, parallaxDistance])
  const guestYBase = useTransform(scrollYProgress, [0, 1], [0, -parallaxDistance])

  const statsY = useSpring(statsYBase, {
    stiffness: 110,
    damping: 28,
    mass: 0.65,
  })

  const guestY = useSpring(guestYBase, {
    stiffness: 110,
    damping: 28,
    mass: 0.65,
  })

  const zoomScaleStyle = {
    transform: `scale(${activeScale})`,
    transformOrigin: "top center" as const,
    transition: "transform 200ms ease-out",
    willChange: "transform" as const,
  }

  return (
    <section
      id="home"
      className="relative -mt-16 w-full overflow-hidden pt-10 pb-8 md:-mt-20 md:pt-16 md:pb-14"
      style={{
        background:
          "linear-gradient(to bottom, var(--hero-bg-indigo-950) 0%, var(--hero-bg-indigo-600) 58%, var(--hero-bg-violet-600) 100%)",
      }}
      aria-label="Hero"
    >
      <div
        className="pointer-events-none absolute top-[62%] left-1/2 h-[360px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-85 blur-[45px] md:top-[60%] md:h-[650px] md:w-[1700px] md:blur-[70px] lg:top-[58%] lg:h-[880px] lg:w-[2400px] lg:blur-[105px] xl:top-[56%] xl:h-[980px] xl:w-[2700px] xl:blur-[120px] 2xl:top-[55%] 2xl:h-[1080px] 2xl:w-[3000px] 2xl:blur-[130px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0) 72%)",
        }}
      />
      <div
        className="pointer-events-none absolute top-[64%] left-1/2 h-[520px] w-[1200px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-65 blur-[110px] md:top-[62%] md:h-[950px] md:w-[2400px] md:blur-[150px] lg:top-[60%] lg:h-[1150px] lg:w-[3200px] lg:blur-[200px] xl:top-[58%] xl:h-[1300px] xl:w-[3600px] xl:blur-[220px] 2xl:top-[57%] 2xl:h-[1450px] 2xl:w-[4000px] 2xl:blur-[240px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0) 75%)",
        }}
      />

      {/* Amplop belakang */}
      <div className={`absolute left-1/2 z-0 w-screen -translate-x-1/2 ${envelopeOffsetClass}`}>
        <div className="bg-indigo-6 pointer-events-none absolute inset-0 z-0" />
        <Image
          src={envelopeSrc}
          alt=""
          className="relative z-0 h-auto w-full max-w-none opacity-0"
          aria-hidden="true"
        />
      </div>

      {/* Amplop depan */}
      <div className={`absolute left-1/2 z-20 w-screen -translate-x-1/2 ${envelopeOffsetClass}`}>
        <div
          className="bg-primary-foreground/10 pointer-events-none absolute inset-0 z-40 backdrop-blur-[20px]"
          style={{ clipPath: frontEnvelopeClipPath }}
        />
        <Image
          src={envelopeSrc}
          alt="Envelope decoration"
          className="relative z-50 h-auto w-full max-w-none"
        />
      </div>

      <div className="h-16 w-full md:h-20" />

      <div
        className="relative mx-auto flex w-full max-w-[1600px] flex-col items-center px-4 text-center md:px-6"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        {promoContent ? (
          <div className="flex flex-col items-center gap-3">
            <motion.span
              initial={{ opacity: 0, y: 25, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: premiumEase, delay: 0.1 }}
              className="text-2xl font-semibold uppercase tracking-widest text-[#f4f4f5] md:text-3xl lg:text-4xl"
            >
              {promoContent.badge}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 25, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.6, ease: premiumEase, delay: 0.2 }}
              className="text-5xl font-semibold tracking-tight text-[#f4f4f5] md:text-7xl lg:text-8xl"
            >
              {promoContent.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.4, ease: premiumEase, delay: 0.35 }}
              className="max-w-md text-base font-normal text-[#f4f4f5] md:text-xl"
            >
              {promoContent.subtitle}
            </motion.p>
          </div>
        ) : (
          <>
            <h1 className="text-primary-foreground max-w-6xl text-3xl leading-tight font-semibold md:text-5xl lg:text-6xl xl:text-7xl">
              <motion.span
                initial={{ opacity: 0, y: 25, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.6, ease: premiumEase, delay: 0.1 }}
                className="inline-block md:whitespace-nowrap"
              >
                {t("headlineLine1")}
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, y: 25, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.6, ease: premiumEase, delay: 0.3 }}
                className="inline-block md:whitespace-nowrap"
              >
                {t("headlineLine2")}
              </motion.span>
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: premiumEase, delay: 0.5 }}
              className="mt-6 hidden md:mt-8 md:flex"
            >
              <Button
                asChild
                variant="secondary"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-12 w-full max-w-[90vw] rounded-[25px] text-base font-semibold shadow-sm md:h-20 md:w-115 md:text-2xl"
              >
                <Link href={ctaHref}>{t("cta")}</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: premiumEase, delay: 0.5 }}
              className="mt-6 flex w-full justify-center md:mt-8 md:hidden"
            >
              <Button
                asChild
                variant="secondary"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 flex h-12 w-full max-w-70 rounded-[15px] text-base font-semibold shadow-sm"
              >
                <Link href={ctaHref}>{t("cta")}</Link>
              </Button>
            </motion.div>
          </>
        )}

        <div className="relative mt-8 w-full md:mt-12 md:w-[90%] lg:w-full" ref={heroRef}>
          <div ref={scaleWrapperRef} className="relative z-10" style={zoomScaleStyle}>
            <div
              className={`relative w-full lg:scale-[1.07]${
                promoContent ? " pointer-events-none select-none blur-sm" : ""
              }`}
            >
              <motion.div
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 70 }}
                animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                transition={{ duration: 1.4, ease: premiumEase, delay: 0.8 }}
                className="absolute top-[10%] bottom-[10%] left-0 z-0 w-[35%] md:w-[45%] lg:w-[25%]"
              >
                <div className="h-full w-full translate-x-1 -rotate-3 rounded-2xl bg-white shadow-lg md:translate-x-2 md:-rotate-[8deg] md:rounded-[32px] lg:translate-x-8 lg:-rotate-[6deg] lg:rounded-[62px]" />
              </motion.div>

              <motion.div
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -70 }}
                animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                transition={{ duration: 1.4, ease: premiumEase, delay: 0.8 }}
                className="absolute top-[10%] right-0 bottom-[10%] z-0 w-[35%] md:w-[45%] lg:w-[25%]"
              >
                <div className="h-full w-full -translate-x-1 rotate-3 rounded-2xl bg-white shadow-lg md:-translate-x-2 md:rotate-[8deg] md:rounded-[32px] lg:-translate-x-8 lg:rotate-[6deg] lg:rounded-[62px]" />
              </motion.div>

              <motion.div
                initial={reduceMotion ? { scale: 0.96 } : { scale: 0.92, y: 150, opacity: 1 }}
                animate={reduceMotion ? { scale: 0.96 } : { scale: 0.96, y: 0, opacity: 1 }}
                transition={{ duration: 1.8, ease: premiumEase, delay: 0.2 }}
                className="relative z-10 origin-bottom"
              >
                <Image
                  src={MainDashboardPreview}
                  alt="Main dashboard preview"
                  className="h-auto w-full rounded-2xl md:rounded-[34px]"
                  priority
                />
              </motion.div>
            </div>
          </div>

          {!promoContent && (
            <div className="pointer-events-none absolute inset-0 z-30" style={zoomScaleStyle}>
              <div className="relative h-full w-full lg:scale-[1.07]">
                <motion.div
                  style={{ y: reduceMotion || !isParallaxReady ? 0 : statsY }}
                  className="pointer-events-auto absolute right-0 top-[16%] z-10 w-[45%] will-change-transform md:right-[2%] md:top-[17%] md:w-[38%] lg:right-[-1%] lg:w-[40%]"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: premiumEase, delay: 1.2 }}
                  >
                    <Image
                      src={StatsPreview}
                      alt="Statistics floating panel"
                      className="h-auto w-full rounded-xl shadow-xl"
                    />
                  </motion.div>
                </motion.div>

                <motion.div
                  style={{ y: reduceMotion || !isParallaxReady ? 0 : guestY }}
                  className="pointer-events-auto absolute bottom-[16%] left-0 z-10 w-[36%] will-change-transform md:bottom-[14%] md:left-[2%] md:w-[30%] lg:left-[0%] lg:w-[32%]"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: premiumEase, delay: 1.4 }}
                  >
                    <Image
                      src={GuestManagementPreview}
                      alt="Guest management floating panel"
                      className="h-auto w-full rounded-xl shadow-xl"
                    />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
