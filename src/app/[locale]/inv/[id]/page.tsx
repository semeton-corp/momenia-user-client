"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"

export default function InvitationViewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [html, setHtml] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [height, setHeight] = useState(812)

  useEffect(() => {
    const stored = localStorage.getItem(`inv:${id}`)
    if (!stored) { setNotFound(true); return }
    setHtml(stored)
  }, [id])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "memoriaResize" && typeof e.data.height === "number") {
        setHeight(e.data.height)
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !html) return
    iframe.setAttribute("srcdoc", html)
  }, [html])

  if (notFound) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-950 text-gray-100">
        <p className="text-lg font-semibold">Undangan tidak ditemukan.</p>
        <button
          onClick={() => router.push("/en/admin/templates")}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 transition"
        >
          Kembali ke Templates
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 py-8 px-4">
      {/* Back bar */}
      <div className="mb-6 flex w-full max-w-sm items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-xs text-gray-500 hover:text-gray-800 transition"
        >
          ← Edit
        </button>
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Preview Undangan</span>
        <div className="w-10" />
      </div>

      {/* Phone frame */}
      <div
        className="relative overflow-hidden shrink-0"
        style={{
          width: 391,
          borderRadius: "2.5rem",
          background: "#1a1a1a",
          border: "8px solid #111",
          outline: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
        }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-10 rounded-b-xl"
          style={{ width: 120, height: 28, background: "#111" }}
        />
        <iframe
          ref={iframeRef}
          sandbox="allow-scripts"
          style={{ width: 375, height, display: "block", border: 0 }}
          title="Invitation View"
        />
      </div>

      <p className="mt-4 text-xs text-gray-400">Undangan ID: {id}</p>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => router.push("/en/admin/templates")}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          Buat Undangan Baru
        </button>
        <button
          onClick={() => {
            const url = `${window.location.origin}/en/inv/${id}`
            navigator.clipboard.writeText(url)
          }}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition"
        >
          Salin Link
        </button>
      </div>
    </div>
  )
}
