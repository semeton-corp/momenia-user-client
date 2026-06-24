"use client"

import * as React from "react"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { Globe, Menu } from "lucide-react"
import LogoMemoria from "@/assets/logo/logo-memoria.png"
import { AnimatePresence, motion } from "framer-motion"

import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { routing } from "@/i18n/routing"

const localeLabels: Record<(typeof routing.locales)[number], string> = {
  id: "ID",
  en: "EN",
}

const localeNames: Record<(typeof routing.locales)[number], string> = {
  id: "Indonesia",
  en: "English",
}

export function PromoNavbar() {
  const locale = useLocale()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const [localeMenuOpen, setLocaleMenuOpen] = React.useState(false)
  const [mobileLocaleMenuOpen, setMobileLocaleMenuOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const mobileMenuRef = React.useRef<HTMLDivElement>(null)

  const tCommon = useTranslations("common")
  const tNavbar = useTranslations("navbar")

  const navItems = [
    { id: "home" as const, label: tNavbar("sections.home") },
    { id: "features" as const, label: tNavbar("sections.features") },
  ]

  React.useEffect(() => {
    if (!localeMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setLocaleMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [localeMenuOpen])

  React.useEffect(() => {
    if (!mobileLocaleMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node))
        setMobileLocaleMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [mobileLocaleMenuOpen])

  React.useEffect(() => {
    const mq = globalThis.matchMedia("(min-width: 1024px)")
    const update = () => {
      if (mq.matches) {
        setIsOpen(false)
        setMobileLocaleMenuOpen(false)
      }
    }
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const scrollTo = (id: "home" | "features") => {
    setIsOpen(false)
    requestAnimationFrame(() => {
      if (id === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }
      const el = document.getElementById("features")
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" })
    })
  }

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-[100] w-full border-b border-border/70 bg-white backdrop-blur-md will-change-transform supports-[backdrop-filter]:bg-white"
      style={{ fontFamily: "var(--font-geist-sans)" }}
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 170, damping: 26, mass: 1.05 }}
    >
      <div className="container relative mx-auto flex h-16 items-center px-4 lg:h-20 lg:px-8">
        {/* Logo desktop */}
        <div className="hidden items-center lg:flex">
          <button
            type="button"
            onClick={() => scrollTo("home")}
            className="flex items-center space-x-3"
          >
            <Image src={LogoMemoria} alt="Momenia" className="h-8 w-auto lg:h-9" />
          </button>
        </div>

        {/* Nav links desktop */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 text-sm lg:flex lg:text-base">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="py-2 font-medium text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => scrollTo(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logo mobile */}
        <button
          type="button"
          onClick={() => scrollTo("home")}
          className="flex items-center gap-2 lg:hidden"
        >
          <Image src={LogoMemoria} alt="Momenia" className="h-7 w-auto" />
        </button>

        {/* Mobile sheet */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="ml-auto h-10 w-10 px-0 text-foreground hover:bg-accent focus-visible:bg-transparent focus-visible:ring-0 lg:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">{tCommon("toggleMenu")}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <div className="flex h-full flex-col">
              <SheetTitle className="sr-only">{tNavbar("sheetTitle")}</SheetTitle>
              <div className="px-6 pt-6 text-sm font-medium text-muted-foreground">
                {tNavbar("sheetLabel")}
              </div>
              <div className="mt-4 flex flex-col">
                {navItems.map((item, index) => (
                  <div key={item.id} className="px-6">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-foreground"
                      onClick={() => scrollTo(item.id)}
                    >
                      {item.label}
                    </button>
                    {index !== navItems.length - 1 && (
                      <div className="h-px w-full max-w-[230px] bg-border" />
                    )}
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
                    <span className="text-sm font-medium">
                      {localeLabels[locale as keyof typeof localeLabels] ?? locale}
                    </span>
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
                              locale === loc
                                ? "bg-accent/50 font-medium text-primary"
                                : "text-foreground/70",
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
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop right: language switcher only */}
        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <div className="relative" ref={menuRef}>
            <Button
              variant="outline"
              size="default"
              className="h-9 gap-2 border-border/80 bg-white px-3 font-medium text-foreground shadow-sm hover:bg-accent hover:text-foreground lg:h-10 lg:px-4"
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
                        "hover:bg-accent block w-full px-4 py-2.5 text-left text-sm transition-colors lg:text-base",
                        locale === loc
                          ? "bg-accent/50 font-medium text-primary"
                          : "text-foreground/70",
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
        </div>
      </div>
    </motion.header>
  )
}
