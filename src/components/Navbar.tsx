"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { Menu, Mountain, Globe } from "lucide-react"

import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { routing } from "@/i18n/routing"

type Route = {
  href: "/" | "/about" | "/services" | "/contact"
  labelKey: "home" | "about" | "services" | "contact"
}

const routes: Route[] = [
  { href: "/", labelKey: "home" },
  { href: "/about", labelKey: "about" },
  { href: "/services", labelKey: "services" },
  { href: "/contact", labelKey: "contact" },
]

const localeLabels: Record<(typeof routing.locales)[number], string> = {
  id: "ID",
  en: "EN",
  ja: "JA",
}

export function Navbar() {
  const locale = useLocale()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const [localeMenuOpen, setLocaleMenuOpen] = React.useState(false)
  const t = useTranslations("nav")
  const tCommon = useTranslations("common")
  const menuRef = React.useRef<HTMLDivElement>(null)

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

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-14 min-h-14 items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo: always visible */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Mountain className="h-6 w-6 shrink-0" />
          <span className="font-bold">{tCommon("siteName")}</span>
        </Link>

        {/* Desktop nav: hidden on small screens */}
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex" aria-label="Main">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "hover:text-foreground/80 whitespace-nowrap transition-colors",
                pathname === route.href ? "text-foreground" : "text-foreground/60",
              )}
            >
              {t(route.labelKey)}
            </Link>
          ))}
        </nav>

        {/* Right: mobile menu trigger + locale + auth */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Mobile menu (hamburger) */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={tCommon("toggleMenu")}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex w-[min(100vw-2rem,18rem)] flex-col gap-6 pr-0"
            >
              <SheetTitle className="sr-only">{tCommon("toggleMenu")}</SheetTitle>
              <div className="flex items-center justify-between border-b px-6 pb-4">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Mountain className="h-6 w-6" />
                  <span className="font-bold">{tCommon("siteName")}</span>
                </Link>
              </div>
              <nav className="flex flex-1 flex-col gap-1 px-6" aria-label="Mobile">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "hover:bg-accent hover:text-foreground rounded-md py-2.5 text-sm transition-colors",
                      pathname === route.href
                        ? "text-foreground font-medium"
                        : "text-foreground/70",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {t(route.labelKey)}
                  </Link>
                ))}
              </nav>
              <div className="border-t px-6 pt-4 pb-6">
                <div className="text-muted-foreground mb-3 text-xs font-medium">Language</div>
                <div className="flex flex-wrap gap-2">
                  {routing.locales.map((loc) => (
                    <Link
                      key={loc}
                      href={pathname}
                      locale={loc}
                      className={cn(
                        "hover:bg-accent rounded-md border px-3 py-2 text-sm transition-colors",
                        locale === loc ? "border-foreground/30 bg-accent" : "border-border",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {localeLabels[loc]}
                    </Link>
                  ))}
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <Link href="/login" onClick={() => setIsOpen(false)} className="w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      {tCommon("signIn")}
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)} className="w-full">
                    <Button size="sm" className="w-full">
                      {tCommon("signUp")}
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop: locale + auth */}
          <div className="relative hidden md:block" ref={menuRef}>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setLocaleMenuOpen((o) => !o)}
              type="button"
              aria-expanded={localeMenuOpen}
              aria-haspopup="true"
              aria-label="Language"
            >
              <Globe className="h-4 w-4" />
              <span>{localeLabels[locale as keyof typeof localeLabels] ?? locale}</span>
            </Button>
            {localeMenuOpen && (
              <div className="bg-background border-border absolute top-full right-0 z-50 mt-1 min-w-[6rem] rounded-md border py-1 shadow-lg">
                {routing.locales.map((loc) => (
                  <Link
                    key={loc}
                    href={pathname}
                    locale={loc}
                    className="hover:bg-accent block px-3 py-2 text-left text-sm"
                    onClick={() => setLocaleMenuOpen(false)}
                  >
                    {localeLabels[loc]}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="hidden gap-2 md:flex">
            <Link href="/login">
              <Button variant="outline" size="sm">
                {tCommon("signIn")}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">{tCommon("signUp")}</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
