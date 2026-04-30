"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getTemplate } from "@/lib/invitation/template-store"
import { MOCK_TEMPLATE, SECTION_TYPES, createDefaultInvitation } from "@/lib/invitation/mock-data"
import { renderInvitation } from "@/lib/invitation/renderer"
import type { Invitation, Theme, Template, SectionTypeDef } from "@/lib/invitation/types"
import DynamicForm from "./DynamicForm"
import InvitationPreview from "./InvitationPreview"

const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
const MONTHS_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

function formatDateId(iso: string): string {
  const d = new Date(iso + "T00:00:00")
  return `${DAYS_ID[d.getDay()]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`
}

export default function EditorClient() {
  const router = useRouter()
  const [template, setTemplate] = useState<Template>(MOCK_TEMPLATE)
  const [sectionTypes, setSectionTypes] = useState<Record<string, SectionTypeDef>>(SECTION_TYPES)
  const [invitation, setInvitation] = useState<Invitation>(createDefaultInvitation)
  const [previewPage, setPreviewPage] = useState<string>("cover")
  const [isPublishing, setIsPublishing] = useState(false)
  const previewRef = useRef<HTMLIFrameElement>(null)

  // Load the template chosen from the template list
  useEffect(() => {
    const id = localStorage.getItem("selected_template_id")
    if (!id) return
    const stored = getTemplate(id)
    if (!stored) return
    setTemplate(stored.template)
    setSectionTypes(stored.sectionTypes)
    // Reset invitation with new template defaults
    setInvitation((prev) => ({
      ...prev,
      templateId: stored.template.id,
      theme: { ...stored.template.theme_defaults },
      sectionOrder: stored.template.pages.find((p) => p.id === "main")?.sections.map((s) => s.id) ?? prev.sectionOrder,
    }))
    setPreviewPage(stored.template.pages[0]?.id ?? "cover")
  }, [])

  const initialHtml = useMemo(
    () => renderInvitation(template, invitation, sectionTypes),
    // Re-render only when section order changes (structural change); live data flows via postMessage
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [invitation.sectionOrder, template, sectionTypes]
  )

  const handleFieldChange = useCallback((key: string, value: string) => {
    setInvitation((prev) => {
      const updates: Record<string, string> = { [key]: value }
      if (key === "event_date" && value) {
        updates.event_date_display = formatDateId(value)
      }
      return { ...prev, userData: { ...prev.userData, ...updates } }
    })
  }, [])

  const handleThemeChange = useCallback((key: keyof Theme, value: string) => {
    setInvitation((prev) => ({
      ...prev,
      theme: { ...prev.theme, [key]: value },
    }))
  }, [])

  const handleReorderSection = (fromIdx: number, toIdx: number) => {
    setInvitation((prev) => {
      const newOrder = [...prev.sectionOrder]
      const [removed] = newOrder.splice(fromIdx, 1)
      newOrder.splice(toIdx, 0, removed)
      return { ...prev, sectionOrder: newOrder }
    })
  }

  const dragIndexRef = useRef<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (idx: number) => { dragIndexRef.current = idx }
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverIndex(idx) }
  const handleDrop = (toIdx: number) => {
    const fromIdx = dragIndexRef.current
    if (fromIdx !== null && fromIdx !== toIdx) handleReorderSection(fromIdx, toIdx)
    dragIndexRef.current = null
    setDragOverIndex(null)
  }
  const handleDragEnd = () => { dragIndexRef.current = null; setDragOverIndex(null) }

  const switchPreviewPage = (pageId: string) => {
    setPreviewPage(pageId)
    const iframe = document.querySelector<HTMLIFrameElement>("iframe[title='Invitation Preview']")
    iframe?.contentWindow?.postMessage({ type: "memoriaGoTo", pageId }, "*")
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    await new Promise((r) => setTimeout(r, 1200))
    const invId = Math.random().toString(36).slice(2, 8)
    // Render a final HTML with no guest name placeholder
    const finalHtml = renderInvitation(template, invitation, sectionTypes)
    localStorage.setItem(`inv:${invId}`, finalHtml)
    localStorage.setItem("last_published_inv_id", invId)
    setIsPublishing(false)
    router.push(`/en/inv/${invId}`)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/en/admin/templates")}
            className="text-xs text-gray-400 hover:text-gray-700 transition"
          >
            ← Templates
          </button>
          <span className="text-gray-300">|</span>
          <span className="font-semibold text-gray-900">{template.name}</span>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">Draft</span>
        </div>

        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-60"
        >
          {isPublishing ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Publishing...
            </>
          ) : (
            "Publish & Lihat Undangan"
          )}
        </button>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Left panel — theme & sections */}
        <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white">
          <div className="border-b border-gray-100">
            <div className="px-5 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Tampilan</h2>
            </div>
            <div className="space-y-3 px-5 py-3">
              {(["color_primary", "color_accent", "color_background"] as (keyof Theme)[]).map((key) => {
                const labels: Record<string, string> = {
                  color_primary: "Warna Utama",
                  color_accent: "Warna Aksen",
                  color_background: "Warna Latar",
                }
                return (
                  <div key={key}>
                    <label className="text-xs font-medium text-gray-700">{labels[key]}</label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        value={invitation.theme[key]}
                        onChange={(e) => handleThemeChange(key, e.target.value)}
                        className="h-8 w-12 rounded border border-gray-200 cursor-pointer"
                      />
                      <span className="text-xs text-gray-600">{invitation.theme[key]}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section order */}
          <div className="border-b border-gray-100">
            <div className="px-5 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Susunan Konten</h2>
            </div>
            <div className="space-y-2 px-3 py-2">
              {invitation.sectionOrder.map((sectionId, idx) => (
                <div
                  key={sectionId}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-2 rounded p-2 transition-colors cursor-grab active:cursor-grabbing ${
                    dragOverIndex === idx ? "bg-amber-50 ring-1 ring-amber-300" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                  <div className="flex-1 text-sm text-gray-700 capitalize">{sectionId}</div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleReorderSection(idx, Math.max(0, idx - 1))}
                      disabled={idx === 0}
                      className="rounded p-1 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleReorderSection(idx, Math.min(invitation.sectionOrder.length - 1, idx + 1))}
                      disabled={idx === invitation.sectionOrder.length - 1}
                      className="rounded p-1 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center — preview */}
        <main className="flex flex-1 flex-col overflow-hidden bg-gray-100">
          <div className="flex shrink-0 items-center gap-1 border-b border-gray-200 bg-white px-4 py-2">
            {template.pages.map((p) => (
              <button
                key={p.id}
                onClick={() => switchPreviewPage(p.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  previewPage === p.id
                    ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div
            ref={previewRef as React.RefObject<HTMLDivElement>}
            className="flex flex-1 items-start justify-center overflow-auto p-6"
          >
            <InvitationPreview
              initialHtml={initialHtml}
              invitation={invitation}
              mode="mobile"
              activePage={previewPage}
            />
          </div>
        </main>

        {/* Right — form */}
        <aside className="flex w-80 shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Konten Template</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <DynamicForm
              template={template}
              invitation={invitation}
              onFieldChange={handleFieldChange}
              onThemeChange={handleThemeChange}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
