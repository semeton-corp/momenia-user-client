import createMiddleware from "next-intl/middleware"
import { type NextRequest, NextResponse } from "next/server"
import { routing } from "@/i18n/routing"

const handleI18nRouting = createMiddleware(routing)

export function middleware(request: NextRequest) {
  const isPromoMode = process.env.PROMOTIONAL_PAGE === "true"

  if (isPromoMode) {
    const { pathname } = request.nextUrl

    const matchedLocale = routing.locales.find(
      (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`),
    )
    const locale = matchedLocale ?? routing.defaultLocale
    const promoPath = `/${locale}`

    const normalizedPath = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname
    const isAlreadyOnPromo = normalizedPath === promoPath
    const isApiRoute = pathname.startsWith("/api/")

    if (!isAlreadyOnPromo && !isApiRoute) {
      const url = request.nextUrl.clone()
      url.pathname = promoPath
      return NextResponse.redirect(url)
    }
  }

  return handleI18nRouting(request)
}

export const config = {
  matcher: [String.raw`/((?!api|_next|_vercel|.*\..*).*)`],
}
