"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion"
import { useTranslations } from "next-intl"
import MainDashboardPreview from "@/assets/llandingpage/main-dashboard-preview.svg"
import StatsPreview from "@/assets/llandingpage/stats-preview.svg"
import GuestManagementPreview from "@/assets/llandingpage/guest-management-preview.svg"
import FrontEnvelope from "@/assets/llandingpage/front-envelope.svg"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  const t = useTranslations("landing.hero")
  const frontEnvelopeClipPath =
    "polygon(0 3%, 48.8% 69%, 51.2% 69%, 100% 3%, 100% 100%, 0 100%)"
  const reduceMotion = useReducedMotion()
  const heroRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  })
  
  // Menentukan jarak pergerakan scroll (parallax) secara responsif
  const [parallaxDistance, setParallaxDistance] = React.useState(0)
  
  React.useEffect(() => {
    const updateParallax = () => {
      if (window.innerWidth < 768) {
        setParallaxDistance(80) // Jarak scroll untuk Mobile
      } else if (window.innerWidth < 1024) {
        setParallaxDistance(150) // Jarak scroll untuk iPad/Tablet
      } else {
        setParallaxDistance(250) // Jarak scroll untuk Desktop
      }
    }
    
    updateParallax()
    window.addEventListener("resize", updateParallax)
    return () => window.removeEventListener("resize", updateParallax)
  }, [])

  // Parallax responsif ke semua device berdasarkan state parallaxDistance
  const statsYBase = useTransform(scrollYProgress, [0, 1], [0, parallaxDistance])
  const guestYBase = useTransform(scrollYProgress, [0, 1], [0, -parallaxDistance])

  const statsY = useSpring(statsYBase, {
    stiffness: 80,
    damping: 20,
    mass: 0.5,
  })
  const guestY = useSpring(guestYBase, {
    stiffness: 80,
    damping: 20,
    mass: 0.5,
  })

  // Kurva bezier premium
  const premiumEase = [0.22, 1, 0.36, 1] as [number, number, number, number]

  return (
    <section
      id="home"
      className="relative w-full overflow-hidden pb-8 pt-10 md:pb-14 md:pt-16 -mt-16 md:-mt-20"
      style={{
        background:
          "linear-gradient(to bottom, var(--hero-bg-indigo-950) 0%, var(--hero-bg-indigo-600) 58%, var(--hero-bg-violet-600) 100%)",
      }}
      aria-label="Hero"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 h-[360px] w-[900px] rounded-full blur-[45px] opacity-85 md:top-[60%] md:h-[650px] md:w-[1700px] md:blur-[70px] lg:top-[58%] lg:h-[880px] lg:w-[2400px] lg:blur-[105px] xl:top-[56%] xl:h-[980px] xl:w-[2700px] xl:blur-[120px] 2xl:top-[55%] 2xl:h-[1080px] 2xl:w-[3000px] 2xl:blur-[130px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0) 72%)",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[64%] -translate-x-1/2 -translate-y-1/2 h-[520px] w-[1200px] rounded-full blur-[110px] opacity-65 md:top-[62%] md:h-[950px] md:w-[2400px] md:blur-[150px] lg:top-[60%] lg:h-[1150px] lg:w-[3200px] lg:blur-[200px] xl:top-[58%] xl:h-[1300px] xl:w-[3600px] xl:blur-[220px] 2xl:top-[57%] 2xl:h-[1450px] 2xl:w-[4000px] 2xl:blur-[240px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0) 75%)",
        }}
      />
      {/* Spacer untuk mengompensasi -mt agar konten tidak tertutup Navbar */}
      <div className="h-16 md:h-20 w-full" />
      <div
        className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col items-center px-4 text-center md:px-6"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        
        <h1 className="max-w-6xl text-3xl font-semibold leading-tight text-primary-foreground md:text-5xl lg:text-6xl xl:text-7xl">
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
          className="hidden md:flex mt-6 md:mt-8"
        >
          {/* Tombol desktop dibesarkan lagi ke h-20, w-[460px], text-2xl */}
          <Button
            variant="secondary"
            className="h-12 w-full max-w-[90vw] rounded-[25px] bg-primary-foreground text-base font-semibold text-primary shadow-sm hover:bg-primary-foreground/90 md:h-20 md:w-[460px] md:text-2xl"
          >
            {t("cta")}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: premiumEase, delay: 0.5 }}
          className="flex md:hidden mt-6 md:mt-8 w-full justify-center"
        >
          {/* Tombol mobile tetap aman */}
          <Button
            variant="secondary"
            className="flex h-12 w-full max-w-[280px] rounded-[25px] bg-primary-foreground text-base font-semibold text-primary shadow-sm hover:bg-primary-foreground/90"
          >
            {t("cta")}
          </Button>
        </motion.div>

        <div className="relative mt-8 w-full md:mt-12 md:w-[90%] lg:w-full" ref={heroRef}>
          
          {/* Lapis 0: Amplop Belakang (Hanya Kotak Indigo Paling Belakang) */}
          <div className="absolute -bottom-8 left-[50%] z-0 w-[100vw] -translate-x-1/2 md:-bottom-14">
            <div className="pointer-events-none absolute inset-0 z-0 bg-indigo-6" />
            {/* Bayangan gambar tak terlihat (opacity-0) supaya layer background ini punya tinggi yang sama dengan layer depan */}
            <Image
              src={FrontEnvelope}
              alt=""
              className="relative z-0 h-auto w-full max-w-none opacity-0"
              aria-hidden="true"
            />
          </div>

          {/* Lapis 1: Dashboard Utama (sekarang memiliki z-10 agar berada di depan Lapis 0) */}
          <div className="relative z-10 w-full lg:scale-[1.07]">
            <motion.div
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 70 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              transition={{ duration: 1.4, ease: premiumEase, delay: 0.8 }}
              className="absolute left-0 bottom-[10%] top-[10%] z-0 w-[35%] md:w-[45%] lg:w-[25%]"
            >
              <div className="h-full w-full rounded-2xl bg-white shadow-lg -rotate-3 translate-x-1 md:-rotate-[8deg] md:translate-x-2 md:rounded-[32px] lg:-rotate-[6deg] lg:translate-x-8 lg:rounded-[62px]" />
            </motion.div>
            
            <motion.div
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -70 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              transition={{ duration: 1.4, ease: premiumEase, delay: 0.8 }}
              className="absolute right-0 bottom-[10%] top-[10%] z-0 w-[35%] md:w-[45%] lg:w-[25%]"
            >
              <div className="h-full w-full rounded-2xl bg-white shadow-lg rotate-3 -translate-x-1 md:rotate-[8deg] md:-translate-x-2 md:rounded-[32px] lg:rotate-[6deg] lg:-translate-x-8 lg:rounded-[62px]" />
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

          {/* Lapis 2: Amplop Depan (Hanya Image SVG + Efek Blur) */}
          <div className="absolute -bottom-8 left-[50%] z-20 w-[100vw] -translate-x-1/2 md:-bottom-14">
            <div
              className="-top-2 md:-top-4 lg:-top-6 pointer-events-none absolute inset-0 z-40 bg-primary-foreground/10 backdrop-blur-[20px]"
              style={{ clipPath: frontEnvelopeClipPath }}
            />
            <Image
              src={FrontEnvelope}
              alt="Envelope decoration"
              className="relative z-50 h-auto w-full max-w-none"
            />
          </div>

          {/* Lapis 3: Floating Panels */}
          <div className="pointer-events-none absolute inset-0 z-40 w-full lg:scale-[1.07]">
            <motion.div
              style={{ y: reduceMotion ? 0 : statsY }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.6, ease: premiumEase, delay: 1.2 }}
              className="pointer-events-auto absolute right-0 top-[16%] z-50 w-[45%] md:right-[2%] md:top-[17%] md:w-[38%] lg:right-[-1%] lg:w-[40%]"
            >
              <Image
                src={StatsPreview}
                alt="Statistics floating panel"
                className="h-auto w-full rounded-xl shadow-xl"
              />
            </motion.div>

            <motion.div
              style={{ y: reduceMotion ? 0 : guestY }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.6, ease: premiumEase, delay: 1.4 }}
              className="pointer-events-auto absolute bottom-[16%] left-0 z-50 w-[36%] md:bottom-[14%] md:left-[2%] md:w-[30%] lg:left-[0%] lg:w-[32%]"
            >
              <Image
                src={GuestManagementPreview}
                alt="Guest management floating panel"
                className="h-auto w-full rounded-xl shadow-xl"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}