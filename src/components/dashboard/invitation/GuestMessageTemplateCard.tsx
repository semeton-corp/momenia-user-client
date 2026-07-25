"use client"

import * as React from "react"
import { Check, Plus } from "lucide-react"
import { useToast } from "@/providers/ToastProvider"
import { typography } from "@/lib/typography"
import { WorkspaceCard } from "./WorkspaceCard"

type VariableKey = "guestName" | "eventName" | "link"

const VARIABLE_ORDER: VariableKey[] = ["guestName", "eventName", "link"]

type GuestMessageTemplateCardProps = {
  title: string
  /** Isi default template, placeholder ditulis sebagai {{guestName}}, {{eventName}}, {{link}}. */
  defaultBody: string
  variableLabels: Record<VariableKey, string>
  helperText: string
  saveLabel: string
  savedToast: string
  maxLength?: number
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function chipHtml(key: VariableKey, label: string) {
  return `<span contenteditable="false" data-variable="${key}" class="mx-0.5 inline-block rounded-[4px] bg-indigo-100 px-1.5 py-0.5 align-middle text-sm font-normal text-primary xl:text-base">${escapeHtml(label)}</span>`
}

// Ubah "...{{guestName}}..." jadi HTML, placeholder-nya diganti chip berwarna
// dan baris baru jadi <br/> — dipakai buat isi awal contentEditable.
function buildHtml(body: string, variableLabels: Record<VariableKey, string>) {
  const tokenPattern = /\{\{(guestName|eventName|link)\}\}/g
  let html = ""
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = tokenPattern.exec(body))) {
    html += escapeHtml(body.slice(lastIndex, match.index)).replace(/\n/g, "<br/>")
    const key = match[1] as VariableKey
    html += chipHtml(key, variableLabels[key])
    lastIndex = tokenPattern.lastIndex
  }
  html += escapeHtml(body.slice(lastIndex)).replace(/\n/g, "<br/>")
  return html
}

/**
 * Kartu "Template Pesan Untuk Tamu" — area contentEditable dengan variabel
 * yang dirender sebagai chip berwarna inline, tombol untuk menyisipkan
 * variabel di posisi kursor, dan penghitung karakter.
 *
 * Kontennya sengaja "uncontrolled": HTML awal di-set sekali lewat useEffect
 * (bukan lewat children React), supaya waktu user mengetik langsung di
 * contentEditable, React tidak ikut campur mencocokkan ulang DOM-nya —
 * itu penyebab umum error "Failed to execute 'removeChild'" pada
 * contentEditable yang isinya dikontrol React.
 */
export function GuestMessageTemplateCard({
  title,
  defaultBody,
  variableLabels,
  helperText,
  saveLabel,
  savedToast,
  maxLength = 200,
}: GuestMessageTemplateCardProps) {
  const { toast } = useToast()
  const editorRef = React.useRef<HTMLDivElement>(null)
  const [length, setLength] = React.useState(0)

  const recalcLength = React.useCallback(() => {
    setLength(editorRef.current?.innerText.length ?? 0)
  }, [])

  React.useEffect(() => {
    const el = editorRef.current
    if (!el) return
    el.innerHTML = buildHtml(defaultBody, variableLabels)
    recalcLength()
    // Cuma dijalankan sekali saat mount — lihat catatan "uncontrolled" di atas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const insertVariable = (key: VariableKey) => {
    const el = editorRef.current
    if (!el) return
    el.focus()
    const inserted = document.execCommand("insertHTML", false, `${chipHtml(key, variableLabels[key])}&nbsp;`)
    if (!inserted) {
      el.insertAdjacentHTML("beforeend", `${chipHtml(key, variableLabels[key])}&nbsp;`)
    }
    recalcLength()
  }

  const handleSave = () => {
    toast(savedToast, "success")
  }

  return (
    <WorkspaceCard className="h-fit border-0 px-4 py-4 shadow-none sm:px-6 xl:border xl:p-8 xl:shadow-sm">
      <h3 className={`${typography["2xl"].semibold} text-foreground`}>{title}</h3>

      <div className="relative mt-4 rounded-lg border border-zinc-200 p-4 pb-8 sm:p-5 sm:pb-9">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={recalcLength}
          role="textbox"
          aria-multiline="true"
          aria-label={title}
          className="min-h-32 whitespace-pre-wrap text-sm font-normal leading-7 text-popover-foreground outline-none sm:min-h-36 xl:text-base"
        />
        <span className="absolute bottom-3 right-4 text-sm font-normal text-muted-foreground xl:text-base">
          {length}/{maxLength}
        </span>
      </div>

      <p className="mt-3 text-sm font-normal text-muted-foreground xl:text-base">{helperText}</p>

      {/* Mobile: tombol variabel outline + ikon Plus, Simpan full-width abu-abu
          di bawah, dipisah garis. Desktop pakai versi terisi (di bawah). */}
      <div className="mt-4 xl:hidden">
        <div className="flex flex-wrap gap-2">
          {VARIABLE_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => insertVariable(key)}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-foreground"
            >
              <Plus className="h-4 w-4" />
              {variableLabels[key]}
            </button>
          ))}
        </div>
        <div className="mt-4 border-t border-zinc-200 pt-4">
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-lg bg-zinc-100 py-3 text-sm font-medium text-foreground transition-colors hover:bg-zinc-200"
          >
            {saveLabel}
          </button>
        </div>
      </div>

      {/* Desktop: tombol variabel terisi + ikon Check, Simpan sejajar kanan */}
      <div className="mt-3 hidden items-center justify-between gap-3 xl:flex">
        <div className="flex flex-wrap gap-2">
          {VARIABLE_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => insertVariable(key)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Check className="h-3.5 w-3.5" />
              {variableLabels[key]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {saveLabel}
        </button>
      </div>
    </WorkspaceCard>
  )
}
