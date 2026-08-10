import { NextRequest, NextResponse } from "next/server"

// Google's "Share" button on mobile gives a short link (maps.app.goo.gl/xxx or the
// older goo.gl/maps/xxx) that resolves via an HTTP redirect. A browser can't read that
// redirect's Location header for a cross-origin request (CORS), so it has to be
// followed server-side — this route exists for exactly that one hop.
function isAllowedShortLink(url: URL): boolean {
  if (url.hostname === "maps.app.goo.gl") return true
  if (url.hostname === "goo.gl" && url.pathname.startsWith("/maps/")) return true
  return false
}

// Google Maps place URLs carry the coordinate twice: `@lat,lng,zoom` is just the
// camera's viewport center, while `!3d{lat}!4d{lng}` is the actual pin — for a large
// venue those can differ by hundreds of meters, so the exact one is preferred.
const EXACT_COORDS = /!3d(-?\d{1,3}\.\d+)!4d(-?\d{1,3}\.\d+)/
const VIEWPORT_COORDS = /@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/
const PLACE_NAME = /\/maps\/place\/([^/@]+)/

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url")
  if (!raw) {
    return NextResponse.json({ ok: false, error: "missing_url" }, { status: 400 })
  }

  let shortUrl: URL
  try {
    shortUrl = new URL(raw)
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_url" }, { status: 400 })
  }

  // Restricted to Google's own map-shortener hosts — this endpoint only ever needs to
  // follow one specific redirect, not act as a general-purpose URL fetcher.
  if (!isAllowedShortLink(shortUrl)) {
    return NextResponse.json({ ok: false, error: "unsupported_host" }, { status: 400 })
  }

  let location: string | null
  try {
    const res = await fetch(shortUrl, {
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
    })
    location = res.headers.get("location")
  } catch {
    return NextResponse.json({ ok: false, error: "upstream_error" }, { status: 502 })
  }

  if (!location) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 })
  }

  const exact = EXACT_COORDS.exec(location)
  const viewport = VIEWPORT_COORDS.exec(location)
  const coords = exact ?? viewport
  if (!coords) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 })
  }

  const placeMatch = PLACE_NAME.exec(location)
  const name = placeMatch ? decodeURIComponent(placeMatch[1].replace(/\+/g, " ")) : null

  return NextResponse.json({
    ok: true,
    name,
    lat: Number(coords[1]),
    lng: Number(coords[2]),
  })
}
