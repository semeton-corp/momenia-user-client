"use client"

import { useState, useCallback, useMemo, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import Image from "next/image"
import { useRouter } from "@/i18n/navigation"
import { useLocale } from "next-intl"
import DesktopFrame from "@/assets/dashboard/laptop.png"
import {
  Pencil, Type, Palette, Music, ListOrdered, GripVertical, ChevronDown,
  ChevronLeft, ChevronRight, Undo2, Redo2, Eye, Save, Smartphone, Monitor, Plus, Minus,
  Search, Star, Users, Upload, Play, X, CheckCircle2, Check, Maximize2, Minimize2,
} from "lucide-react"
import { useUserInvitationDetail, useUpdateUserInvitation } from "@/hooks/useUserInvitations"
import { uploadUserInvitationContent } from "@/lib/api/object-storage/object-storage.service"
import { useToast } from "@/providers/ToastProvider"
import { UserInvitationDetail } from "@/lib/api/user-invitation/user-invitation.types"
import { useEditorDirty } from "@/contexts/EditorDirtyContext"
import { ALL_FONTS, getGoogleFontsUrl } from "@/lib/fonts"
import { ACCEPTED_IMAGE_TYPES, toDisplayableImage } from "@/lib/heic"
import { buildEventTime, formatDateId } from "@/lib/event-time"
import {
  buildInvitationHtml,
  DEFAULT_DESKTOP_BACKGROUND,
  DESKTOP_BACKGROUND_FIELD_KEY,
  DESKTOP_CARD_WIDTH,
  openInvitationPreview,
  type ThemeDefaults,
} from "@/lib/invitation-preview"
import { RestoreChangesModal } from "./RestoreChangesModal"
import { ImageCropModal } from "./ImageCropModal"
import { LocationField } from "./LocationField"

type UnsavedState = {
  name: string
  userData: Record<string, string>
  theme: ThemeDefaults
  sectionOrder: string[]
  timestamp: number
}

type HistoryState = {
  name: string
  userData: Record<string, string>
  theme: ThemeDefaults
  sectionOrder: string[]
}

// ── Image upload ─────────────────────────────────────────────────────────────

function UploadDropzone({ value, onChange, invitationId }: { value: string; onChange: (v: string) => void; invitationId: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [converting, setConverting] = useState(false)
  const [pendingImage, setPendingImage] = useState<{ src: string; fileName: string } | null>(null)
  const { toast } = useToast()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ""
    if (!file) return

    // HEIC has to become a JPEG before anything else touches it — the crop modal draws
    // to a canvas, and outside Safari the browser can't decode HEIC at all. Conversion
    // can take a couple of seconds on a 12MP photo, hence the separate spinner.
    setConverting(true)
    try {
      const displayable = await toDisplayableImage(file)
      const src = URL.createObjectURL(displayable)
      setPendingImage({ src, fileName: displayable.name })
    } catch {
      toast("Gagal membaca foto. Coba format JPG atau PNG.", "error")
    } finally {
      setConverting(false)
    }
  }

  const handleCropCancel = () => {
    if (pendingImage) URL.revokeObjectURL(pendingImage.src)
    setPendingImage(null)
  }

  const handleCropConfirm = async (croppedFile: File) => {
    if (pendingImage) URL.revokeObjectURL(pendingImage.src)
    setPendingImage(null)
    setLoading(true)
    try {
      const url = await uploadUserInvitationContent(croppedFile, invitationId)
      onChange(url)
      toast("Image uploaded successfully", "success")
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to upload image", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept={ACCEPTED_IMAGE_TYPES} className="sr-only" onChange={handleFile} />
      {pendingImage && (
        <ImageCropModal
          imageSrc={pendingImage.src}
          fileName={pendingImage.fileName}
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
        />
      )}
      {value ? (
        <div className="relative w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
          <img src={value} alt="" className="w-full h-auto object-contain" />
          {(loading || converting) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/70">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-500" />
              {converting && <span className="text-xs font-medium text-zinc-600">Mengonversi foto...</span>}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex justify-between gap-2 bg-linear-to-t from-black/80 to-black/40 px-3 py-2">
            <button type="button" onClick={() => inputRef.current?.click()} className="flex-1 rounded bg-white/20 px-2 py-1.5 text-xs font-medium text-white transition-all hover:bg-white/30 backdrop-blur-sm">
              Ganti
            </button>
            <button type="button" onClick={() => onChange("")} className="flex-1 rounded bg-red-500/20 px-2 py-1.5 text-xs font-medium text-white transition-all hover:bg-red-500/40 backdrop-blur-sm">
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={loading || converting}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 py-6 transition hover:border-indigo-400 hover:bg-indigo-50/30 disabled:opacity-60">
          {loading || converting ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-500" />
          ) : (
            <Upload className="h-5 w-5 text-indigo-500" />
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-700">
              {converting ? "Mengonversi foto..." : loading ? "Uploading..." : "Upload Photo"}
            </p>
            <p className="text-xs text-zinc-400">Upload a high-quality JPG, PNG, or HEIC image</p>
          </div>
        </button>
      )}
    </>
  )
}

// ── Preview iframe (phone) ──────────────────────────────────────────────────

export type PreviewFrameHandle = {
  scrollToSection: (sectionId: string) => void
}

// Fixed "phone viewport" the invitation renders into — matches a standard iPhone content
// area. Content longer than this scrolls inside the frame instead of growing it.
const VIEWPORT_W = 375
const VIEWPORT_H = 812

// Share of the screen height the phone may occupy on a narrow viewport, clamped so it
// stays sane on both a small SE and a tall Pro Max. Leaves room for the tabs and the top
// of the panel below, so the page doesn't open already needing a scroll to find them.
const MOBILE_PREVIEW_H_RATIO = 0.42
const MOBILE_PREVIEW_H_MIN = 260
const MOBILE_PREVIEW_H_MAX = 420

// Everything stacked around the phone when the preview is expanded: the workspace header
// (60) and bottom nav (90), the editor's own padding and title row (~90), plus the pager
// and control row inside the preview card (~110). What's left is the phone's to use.
const MOBILE_PREVIEW_CHROME_H = 350

// laptop.png's intrinsic size and the percentage insets of its transparent "screen"
// cutout — same inset values TemplateDetailModal.tsx uses to fit a screenshot into this
// same asset, kept in sync here since this frame wraps a live iframe instead of an <Image>.
const LAPTOP_FRAME_W = 3744
const LAPTOP_FRAME_H = 2126
const LAPTOP_SCREEN_INSET = { left: "13.1%", right: "12.6%", top: "2%", bottom: "10%" }

// Fixed layout size of the whole laptop mockup (frame + screen). Deliberately constant:
// the invitation inside is laid out against these exact pixels, so it renders identically
// at every zoom level. Zoom is then applied as a CSS transform over the finished result —
// scaling the picture, never re-running layout — which is why the content no longer
// reflows (or crosses a responsive breakpoint) as you zoom. Same fixed-canvas-plus-
// transform approach the Mobile viewport uses above.
//
// Sized so the screen *cutout* comes out at roughly 1337x899 — a realistic desktop
// viewport. The height is the part that matters: the invitation's cover section is
// min-height:100vh, so a cutout much shorter than a real screen clips it. Scale this
// number to make the mockup bigger or smaller; don't shrink it to fit the panel, that's
// what zoom is for.
const DESKTOP_MOCKUP_BASE_W = 1800
const DESKTOP_MOCKUP_BASE_H = Math.round((DESKTOP_MOCKUP_BASE_W * LAPTOP_FRAME_H) / LAPTOP_FRAME_W)

function resetIframeScroll(iframe: HTMLIFrameElement | null) {
  const body = iframe?.contentDocument?.body
  if (body) body.scrollTop = 0
}


const PreviewFrame = forwardRef<PreviewFrameHandle, {
  html: string
  userData: Record<string, string>
  theme: ThemeDefaults
  activePage: string
  zoom: number
  device: "mobile" | "desktop"
  onPageChange?: (pageId: string) => void
}>(function PreviewFrame({ html, userData, theme, activePage, zoom, device, onPageChange }, ref) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const loadedRef = useRef(false)
  const loadedFontsRef = useRef<Set<string>>(new Set())
  const userDataRef = useRef(userData); userDataRef.current = userData
  const themeRef = useRef(theme); themeRef.current = theme
  const activePageRef = useRef(activePage); activePageRef.current = activePage
  const onPageChangeRef = useRef(onPageChange); onPageChangeRef.current = onPageChange

  // The invitation can navigate itself (its own in-page buttons), so mirror that back
  // to the editor. Read through a ref so the listener is attached exactly once.
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return
      if (e.data?.type === "memoriaPageChange" && typeof e.data.pageId === "string") {
        onPageChangeRef.current?.(e.data.pageId)
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  // Makes the iframe's own <body> scroll internally instead of the document growing to fit
  // content — the html element clips at the fixed viewport, body carries the scrollbar.
  const injectScrollContainment = (doc: Document) => {
    const style = doc.createElement("style")
    style.textContent = `html{height:100%;overflow:hidden}body{height:100%;overflow-y:auto;overflow-x:hidden}`
    doc.head.appendChild(style)
  }

  useEffect(() => {
    const iframe = iframeRef.current; if (!iframe || !html) return
    loadedRef.current = false
    const onLoad = () => {
      loadedRef.current = true
      const doc = iframe.contentDocument
      if (doc) injectScrollContainment(doc)
      iframe.contentWindow?.postMessage({ type: "memoriaUpdate", userData: userDataRef.current, theme: themeRef.current }, "*")
      iframe.contentWindow?.postMessage({ type: "memoriaGoTo", pageId: activePageRef.current }, "*")
    }
    iframe.addEventListener("load", onLoad, { once: true })
    iframe.setAttribute("srcdoc", html)
    return () => iframe.removeEventListener("load", onLoad)
    // device is a dependency on purpose, not because it affects `html`: switching it
    // swaps in a structurally different iframe (bare vs. bezel-wrapped), which unmounts
    // the old element and mounts a fresh one with no srcdoc — since `html` itself didn't
    // change, this effect wouldn't otherwise re-run to fill the new element in.
  }, [html, device])

  const injectFont = (fontName: string) => {
    const iframe = iframeRef.current
    if (!iframe || !fontName) return
    if (loadedFontsRef.current.has(fontName)) return

    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) return

    const isSystem = ["Arial", "Georgia", "Times New Roman", "Courier New", "Verdana", "Trebuchet MS", "Comic Sans MS", "Impact"].includes(fontName)
    if (isSystem) {
      loadedFontsRef.current.add(fontName)
      return
    }

    const link = doc.createElement("link")
    link.href = getGoogleFontsUrl(fontName)
    link.rel = "stylesheet"
    link.onload = () => { loadedFontsRef.current.add(fontName) }
    link.onerror = () => { loadedFontsRef.current.add(fontName) }
    doc.head.appendChild(link)
  }

  useEffect(() => {
    if (!loadedRef.current) return
    injectFont(theme.font_title)
    injectFont(theme.font_body)
    iframeRef.current?.contentWindow?.postMessage({ type: "memoriaUpdate", userData, theme }, "*")
  }, [userData, theme])

  useEffect(() => {
    if (!loadedRef.current) return
    iframeRef.current?.contentWindow?.postMessage({ type: "memoriaGoTo", pageId: activePage }, "*")
    // Switching cover/main should land at the top of that page, not wherever the previous page was scrolled to.
    resetIframeScroll(iframeRef.current)
  }, [activePage])

  // scale = zoom directly, so 100% zoom renders the iframe at its true native
  // 375px width — matching the admin client's (unscaled) live preview 1:1.
  const scale = zoom
  const border = 12 * zoom

  useImperativeHandle(ref, () => ({
    scrollToSection(sectionId: string) {
      const doc = iframeRef.current?.contentDocument
      const el = doc?.querySelector(`[data-section-id="${sectionId}"]`) as HTMLElement | null
      el?.scrollIntoView({ behavior: "smooth", block: "start" })
    },
  }), [])

  // Same content as the standalone /preview route: a narrow card (bare iframe, capped
  // under the 768px breakpoint) left-aligned over the wallpaper the parent draws behind
  // it. Deliberately NOT a full-bleed desktop-width iframe — the invitation's own
  // @media(min-width:768px) CSS switches some templates to a multi-column layout that
  // clips when the surrounding frame isn't actually that wide, which is exactly what a
  // real desktop guest never sees (InvitationViewer.tsx keeps guests on this same narrow
  // card). Zoom is handled by the parent scaling the whole laptop mockup box instead of
  // this iframe, so it's ignored here.
  if (device === "desktop") {
    return (
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        title="Invitation Preview"
        className="h-full shrink-0 border-0 shadow-2xl"
        style={{ width: `min(${DESKTOP_CARD_WIDTH}px, 100%)` }}
      />
    )
  }

  return (
    <div
      className="relative shrink-0 overflow-hidden bg-black shadow-2xl"
      style={{
        // box-sizing: border-box subtracts the border from `width`/`height`, so the
        // border is added on top of the scaled content size here — otherwise the
        // border eats into the visible area and clips the phone's edges.
        width: VIEWPORT_W * scale + border * 2,
        height: VIEWPORT_H * scale + border * 2,
        borderRadius: 48 * zoom,
        border: `${border}px solid #000`,
      }}
    >
      <iframe
        ref={iframeRef}
        // allow-popups(-to-escape-sandbox): the embedded map's own "Buka di Maps" link
        // opens a new tab; without escaping the sandbox that tab inherits our restrictions
        // and Google refuses to render it (ERR_BLOCKED_BY_RESPONSE).
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        title="Invitation Preview"
        style={{
          width: VIEWPORT_W,
          height: VIEWPORT_H,
          border: 0,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      />
    </div>
  )
})

// ── Collapsible card ─────────────────────────────────────────────────────────

function Section({ title, icon, defaultOpen = true, onOpen, children }: {
  title: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  onOpen?: () => void
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) onOpen?.()
  }
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between px-4 py-3.5"
      >
        <span className="flex items-center gap-2.5 text-sm font-semibold text-zinc-900">
          {icon}
          {title}
        </span>
        <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && <div className="space-y-4 px-4 pb-4">{children}</div>}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-medium text-zinc-600">{children}</label>
}

function TextField({ value, onChange, placeholder, max = 100 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; max?: number
}) {
  return (
    <div>
      <input
        type="text"
        value={value}
        maxLength={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      />
      <p className="mt-1 text-right text-[11px] text-zinc-400">{value.length}/{max}</p>
    </div>
  )
}

// ── Main Editor ───────────────────────────────────────────────────────────────

// Month names for the "Last modified" stamp. (The event-date formatter that also used
// these now lives in @/lib/event-time, shared with the invitation dashboard.)
const MONTHS_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]

function formatLastModified(dateStr: string) {
  const date = new Date(dateStr)
  const month = MONTHS_ID[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${day} ${month} ${year}, ${hours}:${minutes}`
}

const SECTION_LABELS: Record<string, string> = {
  cover_section: "Cover",
  hero_section: "Hero Section",
  couple_section: "Bride & Groom",
  details_section: "Event Information",
}

function EditorLoaded({ detail, invitationId }: { detail: UserInvitationDetail; invitationId: string }) {
  const router = useRouter()
  const locale = useLocale()
  const { toast } = useToast()
  const { template } = detail
  const { mutate: saveInvitation, isPending: isSaving } = useUpdateUserInvitation(invitationId)

  const mainPage = template.pages.find((p) => p.id === "main")
  const defaultSectionOrder = mainPage?.sections.map((s) => s.id) ?? []

  const [userData, setUserData] = useState<Record<string, string>>(detail.fieldValues ?? {})
  const [name, setName] = useState(detail.name || "")
  const [isEditingName, setIsEditingName] = useState(false)
  const [theme, setTheme] = useState(template.theme_defaults)
  const [sectionOrder, setSectionOrder] = useState(defaultSectionOrder)
  const [activePageIdx, setActivePageIdx] = useState(0)
  // Separate zoom per device: Desktop's 1280px canvas needs a much smaller default than
  // Mobile's 375px one to fit the same preview pane, and each mode should keep its own
  // level when you switch back and forth instead of inheriting whatever the other was at.
  const [mobileZoom, setMobileZoom] = useState(1)
  const [desktopZoom, setDesktopZoom] = useState(0.6)
  // Purely a preview-panel toggle — doesn't affect what's saved. "Desktop" mirrors what
  // a desktop guest actually sees on the published invitation (InvitationViewer.tsx):
  // the same phone-width card, left-aligned, over the theme's wallpaper. "Mobile" is
  // today's plain centered mockup, matching how it fills a guest's actual phone screen.
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile")
  // Mobile-only chrome. On lg+ both panels are always visible side by side, so neither of
  // these is ever read there — every consumer is guarded by an `lg:` class that wins.
  const [mobilePanel, setMobilePanel] = useState<"design" | "content">("design")
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false)
  const zoom = previewDevice === "desktop" ? desktopZoom : mobileZoom
  const setZoom = previewDevice === "desktop" ? setDesktopZoom : setMobileZoom

  // Below lg there's no zoom control (no room for one), so the preview has to size itself
  // to the screen instead — at the desktop default a 375x812 phone is taller than the whole
  // viewport and gets cropped. Gated on a max-width query that can never match at lg+, so
  // desktop keeps using its own zoom state untouched.
  const [viewport, setViewport] = useState({ isNarrow: false, width: 0, height: 0 })
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)")
    const update = () => setViewport({ isNarrow: mq.matches, width: window.innerWidth, height: window.innerHeight })
    update()
    mq.addEventListener("change", update)
    window.addEventListener("resize", update)
    return () => {
      mq.removeEventListener("change", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  const previewZoom = useMemo(() => {
    if (!viewport.isNarrow) return zoom
    // Page padding (16px each side) + preview panel padding (12px each side).
    const available = Math.max(240, viewport.width - 56)
    if (previewDevice === "desktop") return +(available / DESKTOP_MOCKUP_BASE_W).toFixed(3)
    // Expanded hands the phone every pixel the surrounding chrome isn't using; otherwise
    // it's capped so the tabs and panel below stay on screen.
    const maxH = isPreviewExpanded
      ? Math.max(MOBILE_PREVIEW_H_MIN, viewport.height - MOBILE_PREVIEW_CHROME_H)
      : Math.min(
          MOBILE_PREVIEW_H_MAX,
          Math.max(MOBILE_PREVIEW_H_MIN, viewport.height * MOBILE_PREVIEW_H_RATIO),
        )
    // Fit whichever runs out first — width on a small phone, height on a tall one.
    return +Math.min(available / VIEWPORT_W, maxH / VIEWPORT_H).toFixed(3)
  }, [viewport, zoom, previewDevice, isPreviewExpanded])
  const dragIndexRef = useRef<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const previewRef = useRef<PreviewFrameHandle>(null)
  const previewScrollRef = useRef<HTMLDivElement>(null)

  // ── History / Undo-Redo ────────────────────────────────────────────────
  const initialState: HistoryState = {
    name: detail.name || "",
    userData: detail.fieldValues ?? {},
    theme: template.theme_defaults,
    sectionOrder: defaultSectionOrder,
  }
  const [history, setHistory] = useState<HistoryState[]>([initialState])
  const [historyIndex, setHistoryIndex] = useState(0)

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const addToHistory = useCallback((state: HistoryState) => {
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), state])
    setHistoryIndex((prev) => prev + 1)
  }, [historyIndex])

  const handleUndo = useCallback(() => {
    if (!canUndo) return
    const newIndex = historyIndex - 1
    const state = history[newIndex]
    setName(state.name)
    setUserData(state.userData)
    setTheme(state.theme)
    setSectionOrder(state.sectionOrder)
    setHistoryIndex(newIndex)
  }, [canUndo, historyIndex, history])

  const handleRedo = useCallback(() => {
    if (!canRedo) return
    const newIndex = historyIndex + 1
    const state = history[newIndex]
    setName(state.name)
    setUserData(state.userData)
    setTheme(state.theme)
    setSectionOrder(state.sectionOrder)
    setHistoryIndex(newIndex)
  }, [canRedo, historyIndex, history])

  // Track state changes for undo/redo (debounced to avoid excessive history entries)
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current)
    historyTimeoutRef.current = setTimeout(() => {
      const currentState: HistoryState = { name, userData, theme, sectionOrder }
      const lastState = history[historyIndex]
      if (JSON.stringify(currentState) !== JSON.stringify(lastState)) {
        addToHistory(currentState)
      }
    }, 300)
    return () => {
      if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current)
    }
  }, [name, userData, theme, sectionOrder, addToHistory, history, historyIndex])

  // Snapshot of the last-saved state, used to detect unsaved changes
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify({ name: detail.name || "", userData: detail.fieldValues ?? {}, theme: template.theme_defaults, sectionOrder: defaultSectionOrder })
  )
  const isDirty = useMemo(() => {
    return JSON.stringify({ name, userData, theme, sectionOrder }) !== savedSnapshot
  }, [name, userData, theme, sectionOrder, savedSnapshot])
  const { setIsDirty } = useEditorDirty()
  useEffect(() => {
    setIsDirty(isDirty)
    return () => setIsDirty(false)
  }, [isDirty, setIsDirty])

  // ── Autosave / restore ──────────────────────────────────────────────────
  const autosaveKey = `momenia_autosave_${invitationId}`
  const [unsavedState, setUnsavedState] = useState<UnsavedState | null>(null)
  const hasCheckedAutosave = useRef(false)

  // On mount: check for a leftover autosave that differs from the last-saved state
  useEffect(() => {
    if (hasCheckedAutosave.current) return
    hasCheckedAutosave.current = true
    try {
      const raw = localStorage.getItem(autosaveKey)
      if (!raw) return
      const parsed: UnsavedState = JSON.parse(raw)
      const parsedSnapshot = JSON.stringify({
        name: parsed.name,
        userData: parsed.userData,
        theme: parsed.theme,
        sectionOrder: parsed.sectionOrder,
      })
      if (parsedSnapshot !== savedSnapshot) {
        setUnsavedState(parsed)
      } else {
        localStorage.removeItem(autosaveKey)
      }
    } catch {
      localStorage.removeItem(autosaveKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced autosave whenever the form is dirty
  useEffect(() => {
    if (!isDirty) return
    const t = setTimeout(() => {
      try {
        const state: UnsavedState = { name, userData, theme, sectionOrder, timestamp: Date.now() }
        localStorage.setItem(autosaveKey, JSON.stringify(state))
      } catch {
        // ignore storage errors (e.g. quota exceeded, private mode)
      }
    }, 800)
    return () => clearTimeout(t)
  }, [name, userData, theme, sectionOrder, isDirty, autosaveKey])

  const handleRestore = (state: UnsavedState) => {
    setName(state.name)
    setUserData(state.userData)
    setTheme(state.theme)
    setSectionOrder(state.sectionOrder)
    setUnsavedState(null)
  }

  const handleDiscardAutosave = () => {
    try {
      localStorage.removeItem(autosaveKey)
    } catch {
      // ignore
    }
    setUnsavedState(null)
  }

  const activePage = template.pages[activePageIdx]?.id ?? "cover"
  const html = useMemo(() => buildInvitationHtml(detail, userData, theme, sectionOrder), [detail, sectionOrder, template])

  // friendly label for a (possibly generated) section id, via its section_type_id
  const sectionLabel = useCallback((id: string) => {
    if (SECTION_LABELS[id]) return SECTION_LABELS[id]
    const sec = template.pages.flatMap((p) => p.sections).find((s) => s.id === id)
    const typeId = sec?.section_type_id ?? id
    return (SECTION_LABELS[typeId] ?? typeId.replace(/^minimalist_/, "").replace(/_/g, " "))
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }, [template.pages])

  // the invitation navigated itself (e.g. its "Let's Party" button) — follow along so
  // the page indicator, content list and field groups all show that page
  const handlePreviewPageChange = useCallback((pageId: string) => {
    const idx = template.pages.findIndex((p) => p.id === pageId)
    if (idx >= 0) setActivePageIdx(idx)
  }, [template.pages])

  // when a Content field-group is expanded, scroll the mockup to the matching section
  const handleSectionOpen = useCallback((sectionTypeId: string) => {
    const instance = template.pages[activePageIdx]?.sections.find((s) => s.section_type_id === sectionTypeId)
    if (instance) previewRef.current?.scrollToSection(instance.id)
  }, [template.pages, activePageIdx])

  const handleFieldChange = useCallback((key: string, value: string) => {
    setUserData((prev) => {
      const next = { ...prev, [key]: value }
      if (key === "event_date" && value) next.event_date_display = formatDateId(value)
      return next
    })
  }, [])

  const handleSave = () => {
    // Rebuild template with the current theme + reordered main sections
    const updatedTemplate: UserInvitationDetail["template"] = {
      ...template,
      theme_defaults: theme,
      pages: template.pages.map((page) =>
        page.id === "main"
          ? {
              ...page,
              sections: sectionOrder
                .map((id) => page.sections.find((s) => s.id === id))
                .filter((s): s is (typeof page.sections)[number] => Boolean(s)),
            }
          : page
      ),
    }

    // Use the existing slug, or generate from name as fallback
    const slug = detail.slug || name.toLowerCase().replace(/\s+/g, "-")

    if (!slug) {
      toast("Error: Please enter an invitation name", "error")
      return
    }

    const eventTime = buildEventTime(userData)

    saveInvitation({
      name: name,
      slug: slug,
      fieldValues: userData,
      status: detail.status,
      template: updatedTemplate,
      // Only sent once there's a date to derive it from — see buildEventTime.
      ...(eventTime ? { eventTime } : {}),
    }, {
      onSuccess: () => {
        setSavedSnapshot(JSON.stringify({ name, userData, theme, sectionOrder }))
        try {
          localStorage.removeItem(autosaveKey)
        } catch {
          // ignore
        }
        toast("Invitation saved successfully", "success")
        router.push(`/dashboard/my-invitation/${invitationId}`)
      },
      onError: (err) => {
        toast(err instanceof Error ? err.message : "Failed to save invitation", "error")
      },
    })
  }

  // Group fields by their `section` value, preserving first-seen order.
  // (field.section is the source of truth — it may not match generated page section ids.)
  const groups = useMemo(() => {
    const order: string[] = []
    const bySection = new Map<string, typeof template.schema.fields>()
    for (const f of template.schema.fields) {
      // The desktop wallpaper is page-wide rather than one section's content, so it's
      // pulled out here and rendered as its own card below the section groups instead.
      if (f.key === DESKTOP_BACKGROUND_FIELD_KEY) continue
      if (!bySection.has(f.section)) { bySection.set(f.section, []); order.push(f.section) }
      bySection.get(f.section)!.push(f)
    }

    return order.map((sectionId) => ({
      sectionId,
      label: SECTION_LABELS[sectionId] ?? sectionId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      fields: bySection.get(sectionId)!,
    }))
  }, [template.schema.fields])

  // Only show sections/fields that belong to the page currently shown in the preview,
  // so switching pages doesn't dump every field from every page on the user at once.
  const activePageSectionTypeIds = useMemo(() => {
    const page = template.pages[activePageIdx]
    return new Set((page?.sections ?? []).map((s) => s.section_type_id))
  }, [template.pages, activePageIdx])

  // Sort visible groups to match the left panel's Content List order.
  // For main page: use sectionOrder (user's reorder). For other pages: use page.sections order.
  const visibleGroups = useMemo(() => {
    const filtered = groups.filter((g) => activePageSectionTypeIds.has(g.sectionId))

    const page = template.pages[activePageIdx]
    const sectionIds = activePage === "main" ? sectionOrder : (page?.sections ?? []).map(s => s.id)

    // Map each section ID to its section_type_id
    const typeIdOrder = sectionIds.map(sectionId => {
      const section = template.pages.flatMap(p => p.sections).find(s => s.id === sectionId)
      return section?.section_type_id
    })

    // Sort groups to match the left panel's order
    return filtered.sort((a, b) => {
      const idxA = typeIdOrder.indexOf(a.sectionId)
      const idxB = typeIdOrder.indexOf(b.sectionId)
      return idxA - idxB
    })
  }, [groups, activePageSectionTypeIds, activePage, sectionOrder, template.pages, activePageIdx])

  // The desktop wallpaper is a platform-wide feature rather than per-template content, so the
  // editor always offers it on its own card — templates don't have to declare it in their
  // schema.json, which also means it reaches invitations created before the field existed.
  // A template that *does* declare it just gets to customise the label.
  const desktopBackgroundField = useMemo(
    () => template.schema.fields.find((f) => f.key === DESKTOP_BACKGROUND_FIELD_KEY),
    [template.schema.fields]
  )

  const swatch = (key: keyof ThemeDefaults, label: string) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-600">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-zinc-200 p-1 pr-2">
        <label className="relative h-6 w-6 cursor-pointer overflow-hidden rounded-md" style={{ background: theme[key] }}>
          <input type="color" value={theme[key]} onChange={(e) => setTheme((p) => ({ ...p, [key]: e.target.value }))} className="absolute inset-0 cursor-pointer opacity-0" />
        </label>
        <span className="text-xs font-medium uppercase text-zinc-500">{theme[key]}</span>
      </div>
    </div>
  )

  return (
    // bottom-[90px]: the workspace layout's mobile nav is a 90px fixed bar at z-40, so
    // without this the editor's own bottom row sits underneath it and can't be tapped.
    <div className="fixed inset-x-0 top-15 bottom-[90px] z-30 flex flex-col gap-4 overflow-y-auto bg-zinc-50 p-4 sm:p-6 lg:left-24 lg:top-0 lg:bottom-0 lg:overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 pl-6">
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setIsEditingName(false) }}
                placeholder="Untitled Invitation"
                className="min-w-0 rounded-lg border border-indigo-300 px-2 py-1 text-xl font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            ) : (
              <>
                <span className="truncate text-xl font-bold text-zinc-900">
                  {name || "Untitled Invitation"}
                </span>
                <button onClick={() => setIsEditingName(true)} aria-label="Edit name">
                  <Pencil className="h-4 w-4 shrink-0 text-zinc-400 hover:text-indigo-500" />
                </button>
              </>
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
              <Check className="h-2.5 w-2.5 text-white" />
            </span>
            Last modified {detail.lastUpdatedAt && formatLastModified(detail.lastUpdatedAt)}
          </p>
        </div>

        {/* device toggle (center) — switches how the preview panel wraps the phone
            mockup, not what gets saved; the invitation itself is always mobile-built.
            Mobile shows this under the preview instead, where there's room for it. */}
        <div className="hidden items-center gap-1 rounded-xl bg-indigo-100 p-1 lg:flex">
          <button
            onClick={() => setPreviewDevice("mobile")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              previewDevice === "mobile" ? "bg-white text-indigo-700 shadow-sm" : "text-indigo-600/70 hover:text-indigo-700"
            }`}
          >
            <Smartphone className="h-4 w-4" />Mobile
          </button>
          <button
            onClick={() => setPreviewDevice("desktop")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              previewDevice === "desktop" ? "bg-white text-indigo-700 shadow-sm" : "text-indigo-600/70 hover:text-indigo-700"
            }`}
          >
            <Monitor className="h-4 w-4" />Desktop
          </button>
        </div>

        {/* actions — undo/redo move under the preview on mobile, Preview/Save into the
            bottom action bar, so this whole row is desktop-only. */}
        <div className="hidden items-center gap-2 lg:flex">
          <button onClick={handleUndo} disabled={!canUndo} aria-label="Undo" title={canUndo ? "Undo" : "Nothing to undo"}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed">
            <Undo2 className="h-4 w-4" />
          </button>
          <button onClick={handleRedo} disabled={!canRedo} aria-label="Redo" title={canRedo ? "Redo" : "Nothing to redo"}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed">
            <Redo2 className="h-4 w-4" />
          </button>
          <button
            onClick={() =>
              // Passes the live editor state, so the popup previews unsaved edits too.
              openInvitationPreview(detail, locale, { userData, theme, sectionOrder, activePage })
            }
            className="flex h-10 items-center gap-2 rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <Eye className="h-4 w-4" />Preview
          </button>
          <button onClick={handleSave} disabled={isSaving} className="flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
            {isSaving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="h-4 w-4" />}
            Save
          </button>
        </div>
      </div>

      {/* ── Body: stacked + tabbed on mobile, 3 columns from lg up ──
          Panels are rendered once and repositioned with `order`, never duplicated per
          breakpoint — a second copy would mount a second PreviewFrame, i.e. a second
          iframe loading the whole invitation again and racing the first one's messages. */}
      <div className="flex flex-col gap-4 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[320px_minmax(0,1fr)_340px]">

        {/* ── Mobile tab switch (Design | Content) ──
            Desktop shows both panels at once, so this is mobile-only chrome. */}
        {!isPreviewExpanded && (
          <div className="order-2 flex shrink-0 gap-1 rounded-2xl border border-zinc-200 bg-white p-1 lg:hidden">
            {(["design", "content"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMobilePanel(tab)}
                aria-pressed={mobilePanel === tab}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${
                  mobilePanel === tab ? "bg-indigo-100 text-indigo-700" : "text-zinc-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* ── LEFT: Design ── */}
        <div
          className={`order-3 min-h-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white lg:order-none lg:flex ${
            !isPreviewExpanded && mobilePanel === "design" ? "flex" : "hidden"
          }`}
        >
          {/* Header is redundant on mobile — the tab above already says "Design". */}
          <div className="hidden border-b border-zinc-100 px-5 py-4 lg:block">
            <h2 className="text-lg font-bold text-zinc-900">Design</h2>
            <p className="text-sm text-zinc-400">Customize the look and feel</p>
          </div>
          <div className="space-y-3 p-4 lg:flex-1 lg:overflow-y-auto">
            <Section title="Typography" icon={<Type className="h-4 w-4 text-indigo-500" />}>
              <div>
                <FieldLabel>Heading Font</FieldLabel>
                <div className="flex items-center gap-2">
                  <select value={theme.font_title} onChange={(e) => setTheme((p) => ({ ...p, font_title: e.target.value }))}
                    className="flex-1 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 focus:border-indigo-400 focus:outline-none">
                    {ALL_FONTS.map((f) => <option key={f}>{f}</option>)}
                  </select>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-sm font-bold" style={{ fontFamily: theme.font_title }}>Ag</span>
                </div>
              </div>
              <div>
                <FieldLabel>Body Font</FieldLabel>
                <div className="flex items-center gap-2">
                  <select value={theme.font_body} onChange={(e) => setTheme((p) => ({ ...p, font_body: e.target.value }))}
                    className="flex-1 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 focus:border-indigo-400 focus:outline-none">
                    {ALL_FONTS.map((f) => <option key={f}>{f}</option>)}
                  </select>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-sm" style={{ fontFamily: theme.font_body }}>Ag</span>
                </div>
              </div>
            </Section>

            <Section title="Colors" icon={<Palette className="h-4 w-4 text-indigo-500" />}>
              {swatch("color_primary", "Primary")}
              {swatch("color_background", "Secondary")}
              {swatch("color_accent", "Accent")}
            </Section>

            {process.env.NEXT_PUBLIC_FEATURE_MUSIC === "true" && (
              <Section title="Music" icon={<Music className="h-4 w-4 text-indigo-500" />} defaultOpen={false}>
                <div className="flex items-center gap-3 rounded-xl border border-zinc-200 p-2">
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white"><Play className="h-4 w-4" /></button>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-800">Promise - Laufey</p>
                    <p className="text-xs text-zinc-400">03:54</p>
                  </div>
                  <button className="text-zinc-400 hover:text-zinc-600"><X className="h-4 w-4" /></button>
                </div>
              </Section>
            )}

            <Section title="Content List" icon={<ListOrdered className="h-4 w-4 text-indigo-500" />}>
              {activePage === "main" ? (
                <>
                  <p className="-mt-2 mb-1 text-xs text-zinc-400">Drag and drop to reorder section</p>
                  {sectionOrder.map((id, idx) => (
                    <div key={id} className="relative">
                      {dragOverIndex === idx && (
                        <div className="pointer-events-none absolute -top-2.5 left-0 right-0 h-1 rounded bg-indigo-500" />
                      )}
                      <div draggable
                        onDragStart={() => { dragIndexRef.current = idx }}
                        onDragOver={(e) => { e.preventDefault(); setDragOverIndex(idx) }}
                        onDrop={() => {
                          const from = dragIndexRef.current
                          if (from !== null && from !== idx) {
                            setSectionOrder((prev) => { const n = [...prev]; const [r] = n.splice(from, 1); n.splice(idx, 0, r); return n })
                          }
                          dragIndexRef.current = null; setDragOverIndex(null)
                        }}
                        onDragEnd={() => { dragIndexRef.current = null; setDragOverIndex(null) }}
                        onDragLeave={(e) => {
                          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverIndex(null)
                        }}
                        className="flex cursor-grab items-center justify-between rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-700 transition hover:bg-zinc-50 active:cursor-grabbing">
                        <span>{sectionLabel(id)}</span>
                        <GripVertical className="h-4 w-4 text-zinc-300" />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <p className="-mt-2 mb-1 text-xs text-zinc-400">Sections in this page</p>
                  {(template.pages[activePageIdx]?.sections ?? []).map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-700">
                      <span>{sectionLabel(s.id)}</span>
                    </div>
                  ))}
                </>
              )}
            </Section>
          </div>
        </div>

        {/* ── CENTER: Preview ── (first on mobile, middle column from lg up) */}
        <div className={`order-1 flex shrink-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 lg:order-none lg:min-h-0 lg:flex-1 lg:shrink ${isPreviewExpanded ? "flex-1" : ""}`}>
          {/* pager */}
          <div className="flex shrink-0 items-center justify-center gap-1 border-b border-zinc-100 bg-white py-3 text-sm">
            <button disabled={activePageIdx === 0} onClick={() => setActivePageIdx((i) => Math.max(0, i - 1))}
              className="flex items-center gap-1 px-2 text-zinc-500 disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" />Previous
            </button>
            {template.pages.map((p, i) => (
              <button key={p.id} onClick={() => setActivePageIdx(i)}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-medium ${activePageIdx === i ? "bg-indigo-100 text-indigo-700" : "text-zinc-500 hover:bg-zinc-100"}`}>
                {i + 1}
              </button>
            ))}
            <button disabled={activePageIdx === template.pages.length - 1} onClick={() => setActivePageIdx((i) => Math.min(template.pages.length - 1, i + 1))}
              className="flex items-center gap-1 px-2 text-zinc-500 disabled:opacity-40">
              Next<ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* phone — in "Desktop" mode the card + wallpaper (same content as the
              standalone /preview route) sits inside the laptop.png mockup's screen
              cutout; zoom scales the whole mockup box, not the content inside it.
              Mobile mode is unchanged: centered, padded, on the panel's plain gray. */}
          <div
            ref={previewScrollRef}
            className="flex items-center justify-center overflow-auto p-3 lg:flex-1 lg:p-6"
          >
            {previewDevice === "desktop" ? (
              // Outer box carries the *scaled* size so flex-centering and scrolling see
              // the real footprint — a CSS transform alone leaves the layout box at full
              // size, which would push everything around it.
              <div
                className="shrink-0"
                style={{ width: DESKTOP_MOCKUP_BASE_W * previewZoom, height: DESKTOP_MOCKUP_BASE_H * previewZoom }}
              >
                <div
                  className="relative"
                  style={{
                    width: DESKTOP_MOCKUP_BASE_W,
                    height: DESKTOP_MOCKUP_BASE_H,
                    transform: `scale(${previewZoom})`,
                    transformOrigin: "top left",
                  }}
                >
                  <div
                    className="absolute overflow-hidden"
                    style={{
                      ...LAPTOP_SCREEN_INSET,
                      backgroundImage: `url('${userData[DESKTOP_BACKGROUND_FIELD_KEY] || DEFAULT_DESKTOP_BACKGROUND}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    <PreviewFrame ref={previewRef} html={html} userData={userData} theme={theme} activePage={activePage} zoom={previewZoom} device={previewDevice} onPageChange={handlePreviewPageChange} />
                  </div>
                  <Image src={DesktopFrame} alt="" fill className="pointer-events-none object-contain" priority />
                </div>
              </div>
            ) : (
              <PreviewFrame ref={previewRef} html={html} userData={userData} theme={theme} activePage={activePage} zoom={previewZoom} device={previewDevice} onPageChange={handlePreviewPageChange} />
            )}
          </div>

          {/* Mobile-only controls: the device toggle and undo/redo that live in the top
              bar on desktop, plus a toggle that gives the preview the whole screen. */}
          <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-3 lg:hidden">
            <div className="flex items-center gap-1 rounded-xl bg-indigo-100 p-1">
              <button
                onClick={() => setPreviewDevice("mobile")}
                aria-label="Mobile preview"
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  previewDevice === "mobile" ? "bg-white text-indigo-700 shadow-sm" : "text-indigo-600/70"
                }`}
              >
                <Smartphone className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPreviewDevice("desktop")}
                aria-label="Desktop preview"
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  previewDevice === "desktop" ? "bg-white text-indigo-700 shadow-sm" : "text-indigo-600/70"
                }`}
              >
                <Monitor className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleUndo} disabled={!canUndo} aria-label="Undo"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 disabled:opacity-40">
                <Undo2 className="h-4 w-4" />
              </button>
              <button onClick={handleRedo} disabled={!canRedo} aria-label="Redo"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 disabled:opacity-40">
                <Redo2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsPreviewExpanded((v) => !v)}
                aria-label={isPreviewExpanded ? "Exit fullscreen preview" : "Fullscreen preview"}
                aria-pressed={isPreviewExpanded}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white"
              >
                {isPreviewExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* zoom — each device mode tracks (and remembers) its own level. */}
          <div className="hidden shrink-0 items-center justify-center py-3 lg:flex">
            <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-2 shadow-sm">
              <button onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(1)))} className="text-zinc-500 hover:text-zinc-800"><Plus className="h-4 w-4" /></button>
              <span className="flex items-center gap-1 text-sm font-medium text-zinc-600"><Search className="h-3.5 w-3.5" />{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(1)))} className="text-zinc-500 hover:text-zinc-800"><Minus className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Content ── */}
        <div
          className={`order-3 min-h-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white lg:order-none lg:flex ${
            !isPreviewExpanded && mobilePanel === "content" ? "flex" : "hidden"
          }`}
        >
          {/* Header is redundant on mobile — the tab above already says "Content". */}
          <div className="hidden border-b border-zinc-100 px-5 py-4 lg:block">
            <h2 className="text-lg font-bold text-zinc-900">Content</h2>
            <p className="text-sm text-zinc-400">Update content and setting</p>
          </div>
          <div className="space-y-3 p-4 lg:flex-1 lg:overflow-y-auto">
            {visibleGroups.map((group, gi) => (
              <Section
                key={group.sectionId}
                title={group.label}
                defaultOpen={false}
                onOpen={() => handleSectionOpen(group.sectionId)}
                icon={gi === 0
                  ? <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100"><Star className="h-4 w-4 text-indigo-600" /></span>
                  : <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100"><Users className="h-4 w-4 text-indigo-600" /></span>}
              >
                {group.fields.map((field) => (
                  <div key={field.key}>
                    <FieldLabel>{field.label}{field.required && <span className="ml-0.5 text-indigo-500">*</span>}</FieldLabel>
                    {field.type === "image" ? (
                      <UploadDropzone value={userData[field.key] ?? ""} onChange={(v) => handleFieldChange(field.key, v)} invitationId={invitationId} />
                    ) : field.type === "date" ? (
                      <input type="date" value={userData[field.key] ?? ""} onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                    ) : field.type === "time" ? (
                      <input type="time" value={userData[field.key] ?? ""} onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                    ) : field.type === "location" ? (
                      <LocationField value={userData[field.key] ?? ""} onChange={(v) => handleFieldChange(field.key, v)} />
                    ) : (
                      <TextField value={userData[field.key] ?? ""} placeholder={field.placeholder} onChange={(v) => handleFieldChange(field.key, v)} />
                    )}
                  </div>
                ))}
              </Section>
            ))}

            {/* Page-wide wallpaper, not any one section's content — so it gets its own card
                rather than living inside a section group. Shown only on the first page since
                it applies to the whole invitation; repeating it per page would just be noise. */}
            {activePageIdx === 0 && (
              <Section
                title={desktopBackgroundField?.label || "Background Desktop"}
                defaultOpen={false}
                icon={<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100"><Monitor className="h-4 w-4 text-indigo-600" /></span>}
              >
                <p className="-mt-2 mb-1 text-xs text-zinc-400">
                  Tampil di belakang undangan saat dibuka lewat layar desktop.
                </p>
                <UploadDropzone
                  value={userData[DESKTOP_BACKGROUND_FIELD_KEY] ?? ""}
                  onChange={(v) => handleFieldChange(DESKTOP_BACKGROUND_FIELD_KEY, v)}
                  invitationId={invitationId}
                />
              </Section>
            )}
          </div>
        </div>

        {/* ── Mobile action bar ──
            Desktop keeps these in the top bar; on mobile that row has no space left, so
            they move down here. Same handlers — only the placement differs. */}
        {!isPreviewExpanded && (
          <div className="order-4 flex shrink-0 items-center gap-3 lg:hidden">
            <button
              onClick={() =>
                openInvitationPreview(detail, locale, { userData, theme, sectionOrder, activePage })
              }
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700"
            >
              <Eye className="h-4 w-4" />Preview
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSaving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        )}
      </div>

      {unsavedState && (
        <RestoreChangesModal
          unsavedState={unsavedState}
          detail={detail}
          onRestore={handleRestore}
          onDiscard={handleDiscardAutosave}
        />
      )}
    </div>
  )
}

// ── Entry point ───────────────────────────────────────────────────────────────

export default function InvitationEditorClient({ invitationId }: { invitationId: string }) {
  const router = useRouter()
  const { data, isLoading, error } = useUserInvitationDetail(invitationId)
  const status = (error as (Error & { status?: number }) | null)?.status

  useEffect(() => {
    // Invitation doesn't exist, or doesn't belong to this user — bounce back to the list
    // instead of leaving them stuck on a dead edit page.
    if (status === 404) {
      router.replace("/dashboard/my-invitation")
    }
  }, [status, router])

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center text-sm text-zinc-400">Loading editor...</div>
  }
  if (status === 404) {
    return null
  }
  if (error || !data) {
    return <div className="flex h-96 items-center justify-center gap-2 text-sm text-red-400"><CheckCircle2 className="h-4 w-4" />Failed to load invitation.</div>
  }
  return <EditorLoaded detail={data} invitationId={invitationId} />
}
