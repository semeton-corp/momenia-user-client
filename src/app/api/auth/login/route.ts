import { NextResponse } from "next/server"
import { backendFetch } from "@/lib/api/client"

/**
 * Frontend memanggil: POST /api/auth/login (domain kamu)
 * Route ini yang memanggil backend asli (server-to-server).
 * Di Network tab user hanya lihat request ke /api/auth/login, bukan ke backend.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const res = await backendFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503 },
    )
  }
}
