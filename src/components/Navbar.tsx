"use client"

import * as React from "react"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { Menu, Globe } from "lucide-react"
import LogoMemoria from "@/assets/logo/logo-memoria.png"
import { AnimatePresence, motion } from "framer-motion"

import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { routing } from "@/i18n/routing"

type SectionItem = {
  id: "home" | "about" | "features" | "review" | "faq"
}

const sectionItems: SectionItem[] = [
  { id: "home" },
  { id: "about" },
  { id: "features" },
  { id: "review" },
  { id: "faq" },
]

const localeLabels: Record<(typeof routing.locales)[number], string> = {
  id: "ID",
  en: "EN",
}

const localeNames: Record<(typeof routing.locales)[number], string> = {
  id: "Indonesia",
  en: "English",
}

export function Navbar() {
  const locale = useLocale()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const [localeMenuOpen, setLocaleMenuOpen] = React.useState(false)
  const [mobileLocaleMenuOpen, setMobileLocaleMenuOpen] = React.useState(false)
  const [hasMounted, setHasMounted] = React.useState(false)
  const [zoomLevel, setZoomLevel] = React.useState(1)
  const [isDesktop, setIsDesktop] = React.useState(false)
  const scaleWrapperRef = React.useRef<HTMLDivElement>(null)
  const tCommon = useTranslations("common")
  const tNavbar = useTranslations("navbar")
  const menuRef = React.useRef<HTMLDivElement>(null)
  const mobileMenuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  // Detect zoom via devicePixelRatio
  React.useEffect(() => {
    const updateZoom = () => setZoomLevel(globalThis.devicePixelRatio || 1)
    updateZoom()
    globalThis.addEventListener("resize", updateZoom)
    return () => globalThis.removeEventListener("resize", updateZoom)
  }, [])

  // Desktop breakpoint (lg = 1024px+). Below that (mobile + iPad/tablet), use sidebar.
  React.useEffect(() => {
    const mq = globalThis.matchMedia("(min-width: 1024px)")
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // Scale mapping (desktop only): 100%→1.00, 110%→0.93, 125%→0.86, 150%→0.75
  const zoomScale = React.useMemo(() => {
    const z = Number.isFinite(zoomLevel) ? zoomLevel : 1
    const clamped = Math.min(1.5, Math.max(1, z))
    const progress = (clamped - 1) / 0.5
    const scale = 1 - progress * 0.25
    return Math.round(scale * 1000) / 1000
  }, [zoomLevel])

  const activeScale = isDesktop ? zoomScale : 1

  // Compensate layout gap caused by transform: scale() on desktop
  React.useEffect(() => {
    const el = scaleWrapperRef.current
    if (!el) return
    const naturalHeight = el.scrollHeight
    const compensation = (activeScale - 1) * naturalHeight
    el.style.transition = "margin-bottom 200ms ease-out"
    el.style.marginBottom = `${compensation}px`
  }, [activeScale])

  React.useEffect(() => {
    if (!localeMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setLocaleMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [localeMenuOpen])

  React.useEffect(() => {
    if (!mobileLocaleMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileLocaleMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [mobileLocaleMenuOpen])

  React.useEffect(() => {
  const mediaQuery = globalThis.matchMedia("(min-width: 1024px)")
    const update = () => {
      if (mediaQuery.matches) {
        setIsOpen(false)
        setMobileLocaleMenuOpen(false)
      }
    }

    update()
    mediaQuery.addEventListener("change", update)
    return () => mediaQuery.removeEventListener("change", update)
  }, [])

  const scrollToSection = (id: SectionItem["id"]) => {
  const headerOffset = globalThis.innerWidth >= 1024 ? 80 : 64
    const extraOffset = 12

    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    const el = document.getElementById(id)
    if (!el) return

    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset - extraOffset
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" })
  }

  const handleSectionClick = (id: SectionItem["id"]) => {
    setIsOpen(false)
    setMobileLocaleMenuOpen(false)
    requestAnimationFrame(() => scrollToSection(id))
  }

  return (
    <motion.header
      className={cn(
        "fixed inset-x-0 top-0 z-[100] w-full border-b border-border/70 bg-white backdrop-blur-md will-change-transform supports-[backdrop-filter]:bg-white",
      )}
      style={{ fontFamily: "var(--font-geist-sans)" }}
      initial={{ y: -72, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 170, damping: 26, mass: 1.05 }}
    >
      <div
        ref={scaleWrapperRef}
        style={{
          transform: `scale(${activeScale})`,
          transformOrigin: "top center",
          transition: "transform 200ms ease-out",
          willChange: "transform",
        }}
      >
      <div className="container relative mx-auto flex h-16 items-center px-4 lg:h-20 lg:px-8">
        <div className="hidden lg:flex items-center">
          <button type="button" onClick={() => handleSectionClick("home")} className="flex items-center space-x-3">
            <Image src={LogoMemoria} alt="Momenia" className="h-8 w-auto lg:h-9" />
          </button>
        </div>
        <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-10 text-sm lg:text-base">
          {sectionItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="py-2 font-medium text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => handleSectionClick(item.id)}
            >
              {tNavbar(`sections.${item.id}`)}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => handleSectionClick("home")}
          className="flex items-center gap-2 lg:hidden"
        >
          <Image src={LogoMemoria} alt="Momenia" className="h-7 w-auto" />
        </button>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="ml-auto h-10 w-10 px-0 text-foreground hover:bg-accent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">{tCommon("toggleMenu")}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <div className="flex h-full flex-col">
              <SheetTitle className="sr-only">{tNavbar("sheetTitle")}</SheetTitle>
              <div className="px-6 pt-6 text-sm font-medium text-muted-foreground">{tNavbar("sheetLabel")}</div>
              <div className="mt-4 flex flex-col">
                {sectionItems.map((item, index) => (
                  <div key={item.id} className="px-6">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-foreground"
                      onClick={() => handleSectionClick(item.id)}
                    >
                      {tNavbar(`sections.${item.id}`)}
                    </button>
                    {index !== sectionItems.length - 1 && <div className="h-px w-full max-w-[230px] bg-border" />}
                  </div>
                ))}
              </div>

              <div className="mt-auto px-6 pb-6">
                <div className="relative" ref={mobileMenuRef}>
                  <Button
                    variant="outline"
                    size="default"
                    className="w-full justify-center gap-2 font-medium"
                    onClick={() => setMobileLocaleMenuOpen((o) => !o)}
                    type="button"
                    aria-expanded={mobileLocaleMenuOpen}
                    aria-haspopup="true"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="text-sm font-medium">{localeLabels[locale as keyof typeof localeLabels] ?? locale}</span>
                  </Button>
                  <AnimatePresence>
                    {mobileLocaleMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-background border-border absolute bottom-full left-0 z-50 mb-2 w-full rounded-lg border py-1.5 shadow-lg"
                      >
                        {routing.locales.map((loc) => (
                          <Link
                            key={loc}
                            href={pathname}
                            locale={loc}
                            className={cn(
                              "hover:bg-accent block w-full px-4 py-2.5 text-left text-sm transition-colors",
                              locale === loc ? "text-primary font-medium bg-accent/50" : "text-foreground/70",
                            )}
                            onClick={() => {
                              setMobileLocaleMenuOpen(false)
                              setIsOpen(false)
                            }}
                          >
                            {localeLabels[loc]}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="my-5 h-px w-full max-w-[230px] bg-border" />
                <div className="flex flex-col gap-3">
                  <Link href="/register" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full border-primary text-primary font-medium hover:bg-primary/5">
                      {tNavbar("signUp")}
                    </Button>
                  </Link>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-primary text-primary-foreground font-medium hover:bg-primary/90">
                      {tNavbar("login")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

    <div className="hidden lg:flex ml-auto items-center gap-3 lg:gap-4">
          <div className="relative" ref={menuRef}>
            <Button
              variant="outline"
              size="default"
      className="h-9 gap-2 border-border/80 bg-white px-3 text-foreground shadow-sm hover:bg-accent hover:text-foreground lg:h-10 lg:px-4 font-medium"
              onClick={() => setLocaleMenuOpen((o) => !o)}
              type="button"
              aria-expanded={localeMenuOpen}
              aria-haspopup="true"
            >
      <Globe className="h-4 w-4 lg:h-5 lg:w-5" />
              <span className="sr-only">{tNavbar("language")}</span>
              <span className="text-sm font-medium md:text-base">
                {localeLabels[locale as keyof typeof localeLabels] ?? locale}
              </span>
            </Button>
            <AnimatePresence>
              {localeMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="bg-background border-border absolute top-full right-0 z-50 mt-2 min-w-[8rem] rounded-lg border py-1.5 shadow-lg"
                >
                  {routing.locales.map((loc) => (
                    <Link
                      key={loc}
                      href={pathname}
                      locale={loc}
                      className={cn(
        "hover:bg-accent block w-full px-4 py-2.5 text-left text-sm lg:text-base transition-colors",
                        locale === loc ? "text-primary font-medium bg-accent/50" : "text-foreground/70",
                      )}
                      onClick={() => setLocaleMenuOpen(false)}
                    >
                      {localeNames[loc]}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="hidden sm:block h-8 w-px bg-border" />
      <div className="hidden sm:flex items-center gap-2 lg:gap-3">
            <Link href="/register">
              <Button
                size="default"
                variant="outline"
        className="h-9 px-4 font-medium border-primary text-primary hover:bg-primary/5 lg:h-10 lg:px-6"
              >
                {tNavbar("signUp")}
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="default"
        className="h-9 bg-primary px-4 font-medium text-primary-foreground hover:bg-primary/90 lg:h-10 lg:px-6"
              >
                {tNavbar("login")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
  </div>
    </motion.header>
  )
}
