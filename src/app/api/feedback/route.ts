import { NextRequest, NextResponse } from "next/server"

type FeedbackEnvironment = "development" | "staging" | "production"

function detectEnvironment(request: NextRequest): FeedbackEnvironment {
  const rawHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host
  const host = rawHost.split(",")[0].trim().toLowerCase().replace(/:\d+$/, "")

  if (host === "localhost" || host === "127.0.0.1" || host === "::1") return "development"
  if (host === "staging.momenia.id" || host.startsWith("staging-")) return "staging"
  if (host === "momenia.id" || host === "www.momenia.id") return "production"

  if (process.env.VERCEL_ENV === "production") return "production"
  if (process.env.VERCEL_ENV === "preview") return "staging"
  return process.env.NODE_ENV === "development" ? "development" : "staging"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function nullableText(value: unknown, maxLength: number): string | null | undefined {
  if (value === null || value === "") return null
  if (typeof value !== "string" || value.length > maxLength) return undefined
  return value.trim() || null
}

function isAppsScriptUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "https:" &&
      url.hostname === "script.google.com" &&
      /^\/macros\/s\/[^/]+\/exec\/?$/.test(url.pathname)
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  if (!isRecord(body)) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 })
  }

  const invitationId = typeof body.invitationId === "string" ? body.invitationId.trim() : ""
  const templateId = nullableText(body.templateId, 200)
  const templateName = nullableText(body.templateName, 200)
  const comment = typeof body.comment === "string" ? body.comment.trim() : null
  const locale = body.locale
  const rating = body.rating

  if (
    !invitationId || invitationId.length > 200 ||
    templateId === undefined || templateName === undefined ||
    comment === null || comment.length > 500 ||
    (locale !== "id" && locale !== "en") ||
    typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 10
  ) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 })
  }

  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_FEEDBACK_URL?.trim()
  if (!appsScriptUrl) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 })
  }
  if (!isAppsScriptUrl(appsScriptUrl)) {
    return NextResponse.json({ ok: false, error: "invalid_configuration" }, { status: 503 })
  }

  const submission = {
    submittedAt: new Date().toISOString(),
    rating,
    comment,
    invitationId,
    templateId,
    templateName,
    locale,
    environment: detectEnvironment(request),
  }

  try {
    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    })
    const responseText = await response.text()
    let confirmation: unknown
    try {
      confirmation = JSON.parse(responseText)
    } catch {
      confirmation = null
    }

    if (!response.ok || !isRecord(confirmation) || confirmation.ok !== true) {
      return NextResponse.json({ ok: false, error: "upstream_failed" }, { status: 502 })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: "upstream_unavailable" }, { status: 502 })
  }
}
