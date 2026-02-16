"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { Menu, Mountain, Globe } from "lucide-react"

import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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
      <div className="container mx-auto flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Mountain className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">{tCommon("siteName")}</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "hover:text-foreground/80 transition-colors",
                  pathname === route.href ? "text-foreground" : "text-foreground/60",
                )}
              >
                {t(route.labelKey)}
              </Link>
            ))}
          </nav>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">{tCommon("toggleMenu")}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
              <Mountain className="mr-2 h-6 w-6" />
              <span className="font-bold">{tCommon("siteName")}</span>
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "text-foreground/70 hover:text-foreground transition-colors",
                      pathname === route.href && "text-foreground",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {t(route.labelKey)}
                  </Link>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="relative" ref={menuRef}>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setLocaleMenuOpen((o) => !o)}
              type="button"
              aria-expanded={localeMenuOpen}
              aria-haspopup="true"
            >
              <Globe className="h-4 w-4" />
              <span className="sr-only">Language</span>
              <span>{localeLabels[locale as keyof typeof localeLabels] ?? locale}</span>
            </Button>
            {localeMenuOpen && (
              <div className="bg-background border-border absolute top-full right-0 z-50 mt-1 min-w-[6rem] rounded-md border py-1 shadow-md">
                {routing.locales.map((loc) => (
                  <Link
                    key={loc}
                    href={pathname}
                    locale={loc}
                    className="hover:bg-accent block w-full px-3 py-2 text-left text-sm"
                    onClick={() => setLocaleMenuOpen(false)}
                  >
                    {localeLabels[loc]}
                  </Link>
                ))}
              </div>
            )}
          </div>
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
    </header>
  )
}
