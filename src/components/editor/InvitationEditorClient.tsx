"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Pencil, Type, Palette, Music, ListOrdered, GripVertical, ChevronDown,
  ChevronLeft, ChevronRight, Undo2, Redo2, Eye, Save, Smartphone, Plus, Minus,
  Search, Star, Users, Upload, Play, X, CheckCircle2,
} from "lucide-react"
import { useUserInvitationDetail, useUpdateUserInvitation } from "@/hooks/useUserInvitations"
import { uploadImage } from "@/lib/api/object-storage/object-storage.service"
import { useToast } from "@/providers/ToastProvider"
import { UserInvitationDetail } from "@/lib/api/user-invitation/user-invitation.types"

// ── Renderer ──────────────────────────────────────────────────────────────────

type SectionType = UserInvitationDetail["template"]["sectionTypes"][string]
type ThemeDefaults = UserInvitationDetail["template"]["theme_defaults"]

function buildHtml(
  detail: UserInvitationDetail,
  userData: Record<string, string>,
  theme: ThemeDefaults,
  sectionOrder: string[]
): string {
  const { template } = detail
  const allCss = Object.values(template.sectionTypes).map((s) => s.css).join("\n")
  const mainPage = template.pages.find((p) => p.id === "main")
  const coverPage = template.pages.find((p) => p.id === "cover")

  function renderSection(sectionId: string, page: typeof mainPage) {
    const sec = page?.sections.find((s) => s.id === sectionId)
    if (!sec) return ""
    const stype: SectionType = template.sectionTypes[sec.section_type_id]
    if (!stype) return ""
    let html = stype.html
    for (const [k, v] of Object.entries(userData)) {
      html = html.replaceAll(`{{${k}}}`, v || "")
    }
    html = html.replace(/\{\{[^}]+\}\}/g, "")
    return html
  }

  const coverSections = (coverPage?.sections ?? []).map((s) => renderSection(s.id, coverPage)).join("\n")
  const mainSections = sectionOrder.map((id) => renderSection(id, mainPage)).join("\n")
  const allJs = Object.values(template.sectionTypes).map((s) => s.js).filter(Boolean).join("\n;\n")

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(theme.font_title)}:wght@300;400;600&family=${encodeURIComponent(theme.font_body)}:wght@400;500&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --color-primary:${theme.color_primary};
  --color-accent:${theme.color_accent};
  --color-background:${theme.color_background};
  --font-title:'${theme.font_title}',Georgia,serif;
  --font-body:'${theme.font_body}',system-ui,sans-serif;
}
body{font-family:var(--font-body);background:var(--color-background);color:var(--color-primary);}
${allCss}
@media (min-width: 768px) {
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  html {
    background-color: #1a1a1a;
    background-image: url('${theme.backgroundImage || "/background-default-desktop.png"}');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
  }
  body {
    display: flex;
    align-items: stretch;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    background: transparent;
    flex-direction: row;
    pointer-events: auto;
  }
  #page-cover, #page-main {
    max-width: 420px;
    width: 100%;
    height: 100%;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    z-index: 10;
    position: relative;
    pointer-events: auto;
    overflow-y: auto;
    overflow-x: hidden;
  }
}
</style>
</head>
<body>
<div id="page-cover" data-page="cover">${coverSections}</div>
<div id="page-main" data-page="main" style="display:none">${mainSections}</div>
<script>
window.__memoriaGoTo = function(pageId) {
  document.querySelectorAll('[data-page]').forEach(function(el){
    el.style.display = el.dataset.page === pageId ? '' : 'none';
  });
  window.parent.postMessage({type:'memoriaResize',height:document.body.scrollHeight},'*');
};
window.addEventListener('message', function(e) {
  if (!e.data) return;
  if (e.data.type === 'memoriaGoTo') { window.__memoriaGoTo(e.data.pageId); return; }
  if (e.data.type === 'memoriaUpdate') {
    var ud = e.data.userData || {};
    var th = e.data.theme || {};
    Object.keys(ud).forEach(function(k){
      document.querySelectorAll('[data-field="'+k+'"]').forEach(function(el){ el.textContent = ud[k] || ''; });
      document.querySelectorAll('[data-field-img="'+k+'"]').forEach(function(el){ if(ud[k]) el.src = ud[k]; });
    });
    if(th.color_primary) document.documentElement.style.setProperty('--color-primary', th.color_primary);
    if(th.color_accent)  document.documentElement.style.setProperty('--color-accent',  th.color_accent);
    if(th.color_background) document.documentElement.style.setProperty('--color-background', th.color_background);
    window.parent.postMessage({type:'memoriaResize',height:document.body.scrollHeight},'*');
  }
});
window.parent.postMessage({type:'memoriaResize',height:document.body.scrollHeight},'*');
${allJs}
</script>
</body>
</html>`
}

// ── Image upload ─────────────────────────────────────────────────────────────

function UploadDropzone({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ""
    if (!file) return
    setLoading(true)
    try {
      const url = await uploadImage(file, "invitation-content")
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
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="sr-only" onChange={handleFile} />
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-zinc-200">
          <img src={value} alt="" className="h-32 w-full object-cover" />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-500" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 px-3 py-1.5">
            <button type="button" onClick={() => inputRef.current?.click()} className="text-xs text-white/90">Ganti</button>
            <button type="button" onClick={() => onChange("")} className="text-xs text-white/60">Hapus</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={loading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 py-6 transition hover:border-indigo-400 hover:bg-indigo-50/30 disabled:opacity-60">
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-500" />
          ) : (
            <Upload className="h-5 w-5 text-indigo-500" />
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-700">{loading ? "Uploading..." : "Upload Photo"}</p>
            <p className="text-xs text-zinc-400">Upload a high-quality JPG or PNG image</p>
          </div>
        </button>
      )}
    </>
  )
}

// ── Preview iframe (phone) ──────────────────────────────────────────────────

function PreviewFrame({ html, userData, theme, activePage, zoom }: {
  html: string
  userData: Record<string, string>
  theme: ThemeDefaults
  activePage: string
  zoom: number
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(812)
  const loadedRef = useRef(false)
  const userDataRef = useRef(userData); userDataRef.current = userData
  const themeRef = useRef(theme); themeRef.current = theme
  const activePageRef = useRef(activePage); activePageRef.current = activePage

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "memoriaResize" && typeof e.data.height === "number") setHeight(e.data.height)
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  useEffect(() => {
    const iframe = iframeRef.current; if (!iframe || !html) return
    loadedRef.current = false
    const onLoad = () => {
      loadedRef.current = true
      iframe.contentWindow?.postMessage({ type: "memoriaUpdate", userData: userDataRef.current, theme: themeRef.current }, "*")
      iframe.contentWindow?.postMessage({ type: "memoriaGoTo", pageId: activePageRef.current }, "*")
    }
    iframe.addEventListener("load", onLoad, { once: true })
    iframe.setAttribute("srcdoc", html)
    return () => iframe.removeEventListener("load", onLoad)
  }, [html])

  useEffect(() => {
    if (!loadedRef.current) return
    iframeRef.current?.contentWindow?.postMessage({ type: "memoriaUpdate", userData, theme }, "*")
  }, [userData, theme])

  useEffect(() => {
    if (!loadedRef.current) return
    iframeRef.current?.contentWindow?.postMessage({ type: "memoriaGoTo", pageId: activePage }, "*")
  }, [activePage])

  const FRAME_W = 340
  const scale = (FRAME_W * zoom) / 375
  const contentH = Math.max(height, 720)

  return (
    <div
      className="relative shrink-0 overflow-hidden bg-black shadow-2xl"
      style={{
        width: FRAME_W * zoom,
        height: contentH * scale,
        borderRadius: 48 * zoom,
        border: `${12 * zoom}px solid #000`,
      }}
    >
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts"
        title="Invitation Preview"
        style={{
          width: 375,
          height: contentH,
          border: 0,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      />
    </div>
  )
}

// ── Collapsible card ─────────────────────────────────────────────────────────

function Section({ title, icon, defaultOpen = true, children }: {
  title: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
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

const DAYS_ID = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"]
const MONTHS_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]
function formatDateId(iso: string) {
  const d = new Date(iso + "T00:00:00")
  return `${DAYS_ID[d.getDay()]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`
}

const SECTION_LABELS: Record<string, string> = {
  cover_section: "Cover",
  hero_section: "Hero Section",
  couple_section: "Bride & Groom",
  details_section: "Event Information",
}

const FONT_OPTIONS = ["Poppins", "Inter", "Playfair Display", "Jakarta Sans", "Lora", "Montserrat"]

function EditorLoaded({ detail, invitationId }: { detail: UserInvitationDetail; invitationId: string }) {
  const router = useRouter()
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
  const [zoom, setZoom] = useState(1)
  const dragIndexRef = useRef<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const activePage = template.pages[activePageIdx]?.id ?? "cover"
  const html = useMemo(() => buildHtml(detail, userData, theme, sectionOrder), [detail, sectionOrder, template])

  // friendly label for a (possibly generated) section id, via its section_type_id
  const sectionLabel = useCallback((id: string) => {
    if (SECTION_LABELS[id]) return SECTION_LABELS[id]
    const sec = template.pages.flatMap((p) => p.sections).find((s) => s.id === id)
    const typeId = sec?.section_type_id ?? id
    return (SECTION_LABELS[typeId] ?? typeId.replace(/^minimalist_/, "").replace(/_/g, " "))
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }, [template.pages])

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

    // Use pathUrl as slug, or generate from name as fallback
    const slug = detail.pathUrl || name.toLowerCase().replace(/\s+/g, "-")

    if (!slug) {
      toast("Error: Please enter an invitation name", "error")
      return
    }

    saveInvitation({
      name: name,
      slug: slug,
      fieldValues: userData,
      status: detail.status,
      template: updatedTemplate,
    })
  }

  // Group fields by their `section` value, preserving first-seen order.
  // (field.section is the source of truth — it may not match generated page section ids.)
  const groups = useMemo(() => {
    const order: string[] = []
    const bySection = new Map<string, typeof template.schema.fields>()
    for (const f of template.schema.fields) {
      if (!bySection.has(f.section)) { bySection.set(f.section, []); order.push(f.section) }
      bySection.get(f.section)!.push(f)
    }
    return order.map((sectionId) => ({
      sectionId,
      label: SECTION_LABELS[sectionId] ?? sectionId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      fields: bySection.get(sectionId)!,
    }))
  }, [template.schema.fields])

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
    <div className="fixed inset-x-0 top-15 bottom-0 z-30 flex flex-col gap-4 overflow-hidden bg-zinc-50 p-4 sm:p-6 lg:left-24 lg:top-0">
      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
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
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Last modified
          </p>
        </div>

        {/* device toggle (center) */}
        <div className="flex items-center gap-2 rounded-xl bg-indigo-100 px-4 py-2.5">
          <Smartphone className="h-4 w-4 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-700">Mobile</span>
        </div>

        {/* actions */}
        <div className="flex items-center gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50"><Undo2 className="h-4 w-4" /></button>
          <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50"><Redo2 className="h-4 w-4" /></button>
          <button
            onClick={() => {
              const htmlContent = buildHtml(detail, userData, theme, sectionOrder)
              const newWindow = window.open("", "_blank")
              if (newWindow) {
                newWindow.document.write(htmlContent)
                newWindow.document.close()
              }
            }}
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

      {/* ── 3-column body ── */}
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)_340px]">

        {/* ── LEFT: Design ── */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-5 py-4">
            <h2 className="text-lg font-bold text-zinc-900">Design</h2>
            <p className="text-sm text-zinc-400">Customize the look and feel</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            <Section title="Typography" icon={<Type className="h-4 w-4 text-indigo-500" />}>
              <div>
                <FieldLabel>Heading Font</FieldLabel>
                <div className="flex items-center gap-2">
                  <select value={theme.font_title} onChange={(e) => setTheme((p) => ({ ...p, font_title: e.target.value }))}
                    className="flex-1 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 focus:border-indigo-400 focus:outline-none">
                    {FONT_OPTIONS.map((f) => <option key={f}>{f}</option>)}
                  </select>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-sm font-bold" style={{ fontFamily: theme.font_title }}>Ag</span>
                </div>
              </div>
              <div>
                <FieldLabel>Body Font</FieldLabel>
                <div className="flex items-center gap-2">
                  <select value={theme.font_body} onChange={(e) => setTheme((p) => ({ ...p, font_body: e.target.value }))}
                    className="flex-1 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 focus:border-indigo-400 focus:outline-none">
                    {FONT_OPTIONS.map((f) => <option key={f}>{f}</option>)}
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
              <p className="-mt-2 mb-1 text-xs text-zinc-400">Drag and drop to reorder section</p>
              {sectionOrder.map((id, idx) => (
                <div key={id} draggable
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
                  className={`flex cursor-grab items-center justify-between rounded-xl border px-3.5 py-3 text-sm text-zinc-700 transition active:cursor-grabbing ${dragOverIndex === idx ? "border-indigo-300 bg-indigo-50" : "border-zinc-200 bg-white hover:bg-zinc-50"}`}>
                  <span>{sectionLabel(id)}</span>
                  <GripVertical className="h-4 w-4 text-zinc-300" />
                </div>
              ))}
            </Section>
          </div>
        </div>

        {/* ── CENTER: Preview ── */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
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

          {/* phone */}
          <div className="flex flex-1 items-start justify-center overflow-auto p-6">
            <PreviewFrame html={html} userData={userData} theme={theme} activePage={activePage} zoom={zoom} />
          </div>

          {/* zoom */}
          <div className="flex shrink-0 items-center justify-center py-3">
            <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-2 shadow-sm">
              <button onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(1)))} className="text-zinc-500 hover:text-zinc-800"><Plus className="h-4 w-4" /></button>
              <span className="flex items-center gap-1 text-sm font-medium text-zinc-600"><Search className="h-3.5 w-3.5" />{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(1)))} className="text-zinc-500 hover:text-zinc-800"><Minus className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Content ── */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-5 py-4">
            <h2 className="text-lg font-bold text-zinc-900">Content</h2>
            <p className="text-sm text-zinc-400">Update content and setting</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {groups.map((group, gi) => (
              <Section
                key={group.sectionId}
                title={group.label}
                icon={gi === 0
                  ? <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100"><Star className="h-4 w-4 text-indigo-600" /></span>
                  : <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100"><Users className="h-4 w-4 text-indigo-600" /></span>}
              >
                {group.fields.map((field) => (
                  <div key={field.key}>
                    <FieldLabel>{field.label}{field.required && <span className="ml-0.5 text-indigo-500">*</span>}</FieldLabel>
                    {field.type === "image" ? (
                      <UploadDropzone value={userData[field.key] ?? ""} onChange={(v) => handleFieldChange(field.key, v)} />
                    ) : field.type === "date" ? (
                      <input type="date" value={userData[field.key] ?? ""} onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                    ) : field.type === "time" ? (
                      <input type="time" value={userData[field.key] ?? ""} onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                    ) : (
                      <TextField value={userData[field.key] ?? ""} placeholder={field.placeholder} onChange={(v) => handleFieldChange(field.key, v)} />
                    )}
                  </div>
                ))}
              </Section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Entry point ───────────────────────────────────────────────────────────────

export default function InvitationEditorClient({ invitationId }: { invitationId: string }) {
  const { data, isLoading, error } = useUserInvitationDetail(invitationId)

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center text-sm text-zinc-400">Loading editor...</div>
  }
  if (error || !data) {
    return <div className="flex h-96 items-center justify-center gap-2 text-sm text-red-400"><CheckCircle2 className="h-4 w-4" />Failed to load invitation.</div>
  }
  return <EditorLoaded detail={data} invitationId={invitationId} />
}
