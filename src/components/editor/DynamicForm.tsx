"use client"

import { useRef, useState } from "react"
import type { Template, Invitation, FieldSchema, Theme } from "@/lib/invitation/types"

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  couple: "Mempelai",
  event_detail: "Detail Acara",
  rsvp: "RSVP",
  gallery: "Galeri",
}

const PHOTO_ACCEPT = ".jpg,.jpeg,.png,.webp,.heic,.heif"
const MAX_PX = 1200 // longest side — keeps postMessage payload small

function resizeToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const blobUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(blobUrl)
      const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL("image/jpeg", 0.85))
    }
    img.onerror = () => { URL.revokeObjectURL(blobUrl); reject(new Error("load failed")) }
    img.src = blobUrl
  })
}

function ImageUpload({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setLoading(true)
    try {
      const dataUrl = await resizeToDataURL(file)
      onChange(dataUrl)
    } catch {
      // fallback: raw data URL
      const reader = new FileReader()
      reader.onload = (ev) => { if (typeof ev.target?.result === "string") onChange(ev.target.result) }
      reader.readAsDataURL(file)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-1.5">
      <input ref={inputRef} type="file" accept={PHOTO_ACCEPT} className="sr-only" onChange={handleFile} />
      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-gray-200">
          <img src={value} alt="" className="h-36 w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-2 py-1">
            <button type="button" onClick={() => inputRef.current?.click()} className="text-[11px] text-white/90 hover:text-white">
              Ganti foto
            </button>
            <button type="button" onClick={() => onChange("")} className="text-[11px] text-white/60 hover:text-white">
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-5 text-sm text-gray-400 transition hover:border-amber-400 hover:text-amber-600 disabled:opacity-60"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-amber-500" />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
          )}
          {loading ? "Memproses..." : "Upload Foto"}
        </button>
      )}
    </div>
  )
}

interface FieldInputProps {
  field: FieldSchema
  value: string
  onChange: (value: string) => void
}

function FieldInput({ field, value, onChange }: FieldInputProps) {
  const baseClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition"

  if (field.type === "image") {
    return <ImageUpload value={value} onChange={onChange} />
  }

  if (field.type === "date") {
    return (
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={baseClass}
      />
    )
  }

  if (field.type === "time") {
    return (
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={baseClass}
      />
    )
  }

  if (field.type === "audio") {
    return (
      <div className="space-y-1">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? "https://..."}
          className={baseClass}
        />
        <p className="text-[11px] text-gray-400">Masukkan URL audio</p>
      </div>
    )
  }

  if (field.type === "textarea") {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={3}
        className={baseClass + " resize-none"}
      />
    )
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className={baseClass}
    />
  )
}

interface Props {
  template: Template
  invitation: Invitation
  onFieldChange: (key: string, value: string) => void
  onThemeChange: (key: keyof Theme, value: string) => void
}

export default function DynamicForm({ template, invitation, onFieldChange, onThemeChange }: Props) {
  const mainPage = template.pages.find((p) => p.id === "main")
  if (!mainPage) return null

  const orderedSections = invitation.sectionOrder
    .map((id) => mainPage.sections.find((s) => s.id === id))
    .filter((s): s is (typeof mainPage.sections)[number] => Boolean(s))

  const groups = orderedSections.map((section) => ({
    id: section.id,
    label: SECTION_LABELS[section.id] ?? section.id,
    fields: template.schema.fields.filter((f) => f.section === section.id),
  }))

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.id}>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              {group.label}
            </span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
          <div className="space-y-3">
            {group.fields.map((field) => (
              <div key={field.key}>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  {field.label}
                  {field.required && <span className="ml-0.5 text-amber-600">*</span>}
                </label>
                <FieldInput
                  field={field}
                  value={invitation.userData[field.key] ?? ""}
                  onChange={(val) => onFieldChange(field.key, val)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
