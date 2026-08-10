"use client"

import { useEffect, useRef, useState } from "react"
import { HelpCircle, MapPin, TriangleAlert } from "lucide-react"

// Google's Share button on mobile gives a short link that only a server can follow
// (the redirect's Location header is unreadable cross-origin from the browser).
const SHORT_LINK = /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)\//i
// A full Maps URL carries the coordinate twice — !3d!4d is the actual pin, @lat,lng is
// just the camera viewport, which can be hundreds of meters off for a large venue.
const EXACT_COORDS = /!3d(-?\d{1,3}\.\d+)!4d(-?\d{1,3}\.\d+)/
const VIEWPORT_COORDS = /@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/
const PLACE_NAME = /\/maps\/place\/([^/@]+)/
const PLAIN_COORDS = /^\s*-?\d{1,3}(?:\.\d+)?\s*,\s*-?\d{1,3}(?:\.\d+)?\s*$/

const GENERIC_ERROR = "Link tidak dikenali. Coba tempel link Google Maps atau alamatnya."

type Resolved = { name: string | null; q: string }

function parseFullMapsUrl(value: string): Resolved | null {
  const coords = EXACT_COORDS.exec(value) ?? VIEWPORT_COORDS.exec(value)
  if (!coords) return null
  const place = PLACE_NAME.exec(value)
  const name = place ? decodeURIComponent(place[1].replace(/\+/g, " ")) : null
  return { name, q: `${coords[1]},${coords[2]}` }
}

function LocationTooltip() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative ml-auto inline-flex shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Cara mengisi lokasi"
        aria-expanded={open}
        className="flex h-4.5 w-4.5 items-center justify-center rounded-full border border-zinc-300 text-zinc-500 transition-colors hover:border-indigo-400 hover:text-indigo-600"
      >
        <HelpCircle className="h-2.75 w-2.75" />
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute right-0 top-[calc(100%+8px)] z-20 w-64 rounded-xl bg-zinc-900 p-3.5 text-white shadow-xl"
        >
          <p className="mb-2 text-[11.5px] font-semibold">Ambil link dari Google Maps</p>
          <ol className="flex flex-col gap-1.5 pl-4 text-[11.5px] leading-relaxed text-zinc-300 [&>li]:list-decimal">
            <li>Buka Google Maps, cari lokasi acaramu</li>
            <li>Tap tombol <strong className="text-white">Bagikan</strong></li>
            <li>Pilih <strong className="text-white">Salin link</strong>, lalu tempel di sini</li>
          </ol>
          <p className="mt-2.5 border-t border-zinc-700 pt-2.5 text-[11px] leading-relaxed text-zinc-400">
            Tidak punya link? Ketik saja nama gedung atau alamatnya.
          </p>
        </div>
      )}
    </div>
  )
}

type LocationFieldProps = {
  value: string
  onChange: (v: string) => void
}

export function LocationField({ value, onChange }: LocationFieldProps) {
  const [mode, setMode] = useState<"edit" | "loading" | "done">(value ? "done" : "edit")
  const [draft, setDraft] = useState(value)
  const [resolvedName, setResolvedName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [syncedValue, setSyncedValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Adjust local state when `value` changes from OUTSIDE this component (undo/redo,
  // restoring an autosave) — but not while the user is actively editing, since that
  // would stomp on what they're typing. Done during render rather than in an effect,
  // per https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (value !== syncedValue) {
    setSyncedValue(value)
    if (mode !== "edit") {
      setMode(value ? "done" : "edit")
      setDraft(value)
    }
  }

  const commit = (loc: Resolved) => {
    setResolvedName(loc.name)
    setError(null)
    setMode("done")
    onChange(loc.q)
  }

  const submit = async () => {
    const v = draft.trim()
    if (!v) { onChange(""); setMode("edit"); return }
    if (v === value && mode !== "edit") return

    if (SHORT_LINK.test(v)) {
      setMode("loading")
      try {
        const res = await fetch(`/api/resolve-maps-link?url=${encodeURIComponent(v)}`)
        const data = await res.json()
        if (!data.ok) { setError(GENERIC_ERROR); setMode("edit"); return }
        commit({ name: data.name, q: `${data.lat},${data.lng}` })
      } catch {
        setError("Gagal membaca link. Coba lagi.")
        setMode("edit")
      }
      return
    }

    if (/^https?:\/\//i.test(v)) {
      const parsed = parseFullMapsUrl(v)
      if (parsed) { commit(parsed); return }
      setError(GENERIC_ERROR)
      setMode("edit")
      return
    }

    // Plain coordinates or free text (venue name / address) — either is a valid
    // value for Maps' own ?q= search, so both are accepted as-is.
    commit({ name: PLAIN_COORDS.test(v) ? null : v, q: v })
  }

  const startEdit = () => {
    setError(null)
    setMode("edit")
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const isCoords = PLAIN_COORDS.test(value)
  const mapQuery = value ? encodeURIComponent(value) : ""

  return (
    <div>
      <div className="mb-1.5 flex items-center">
        <LocationTooltip />
      </div>

      {mode === "edit" && (
        <>
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={submit}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur() } }}
            placeholder="Tempel link Google Maps, atau ketik alamatnya"
            className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-zinc-500">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-zinc-400" />
            Link Google Maps, nama gedung, alamat, atau koordinat.
          </p>
        </>
      )}

      {mode === "loading" && (
        <div className="flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-3">
          <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-500" />
          <span className="text-xs text-zinc-600">Membaca link...</span>
        </div>
      )}

      {mode === "done" && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-600">
            <MapPin className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-zinc-900">
              {resolvedName || (isCoords ? "Titik koordinat" : value)}
            </p>
            <p className="truncate font-mono text-[11px] text-zinc-500">
              {isCoords ? value.replace(",", ", ") : "Dicari sebagai alamat"}
            </p>
          </div>
          <button
            type="button"
            onClick={startEdit}
            className="shrink-0 rounded px-1 text-[11px] font-semibold text-indigo-600 hover:underline"
          >
            Ubah
          </button>
        </div>
      )}

      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-medium text-amber-700">
          <TriangleAlert className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}

      {mode === "done" && value && (
        <>
          <div className="mt-2.5 h-32.5 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
            <iframe
              key={mapQuery}
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              title="Pratinjau lokasi"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0"
            />
          </div>
          <a
            href={`https://www.google.com/maps?q=${mapQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-block text-[11px] font-medium text-indigo-600 hover:underline"
          >
            Cek di Google Maps
          </a>
        </>
      )}
    </div>
  )
}
