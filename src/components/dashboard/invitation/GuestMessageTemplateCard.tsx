"use client"

import * as React from "react"
import { Check, Plus } from "lucide-react"
import { typography } from "@/lib/typography"
import { WorkspaceCard } from "./WorkspaceCard"

const GUEST_NAME_ATTR = "guestName"

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function chipHtml(label: string) {
  return `<span contenteditable="false" data-variable="${GUEST_NAME_ATTR}" class="mx-0.5 inline-block rounded-[4px] bg-indigo-100 px-1.5 py-0.5 align-middle text-sm font-normal text-primary xl:text-base">${escapeHtml(label)}</span>`
}

// Ubah "...{{guestName}}..." jadi HTML, placeholder-nya diganti chip berwarna
// dan baris baru jadi <br/> — dipakai buat isi awal contentEditable.
function buildHtml(body: string, variableLabel: string) {
  const tokenPattern = /\{\{guestName\}\}/g
  let html = ""
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = tokenPattern.exec(body))) {
    html += escapeHtml(body.slice(lastIndex, match.index)).replace(/\n/g, "<br/>")
    html += chipHtml(variableLabel)
    lastIndex = tokenPattern.lastIndex
  }
  html += escapeHtml(body.slice(lastIndex)).replace(/\n/g, "<br/>")
  return html
}

// Kebalikan dari buildHtml — dipanggil saat Simpan, mengubah isi contentEditable
// (chip span + <br>/<div> dari browser) balik jadi raw text "...{{guestName}}...".
function nodeToRaw(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ""
  if (node.nodeType !== Node.ELEMENT_NODE) return ""
  const el = node as HTMLElement
  if (el.tagName === "BR") return "\n"
  if (el.getAttribute("data-variable") === GUEST_NAME_ATTR) return "{{guestName}}"
  const childText = Array.from(el.childNodes).map(nodeToRaw).join("")
  return el.tagName === "DIV" || el.tagName === "P" ? `\n${childText}` : childText
}

function extractRawText(root: HTMLElement): string {
  const raw = Array.from(root.childNodes).map(nodeToRaw).join("")
  return raw.startsWith("\n") ? raw.slice(1) : raw
}

type GuestMessageTemplateCardProps = {
  title: string
  /** Isi awal template, placeholder ditulis sebagai {{guestName}}. */
  body: string
  variableLabel: string
  helperText: string
  saveLabel: string
  onSave: (rawBody: string) => void
  isSaving?: boolean
  maxLength?: number
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
  body,
  variableLabel,
  helperText,
  saveLabel,
  onSave,
  isSaving,
  maxLength = 200,
}: GuestMessageTemplateCardProps) {
  const editorRef = React.useRef<HTMLDivElement>(null)
  const [length, setLength] = React.useState(0)

  const recalcLength = React.useCallback(() => {
    setLength(editorRef.current?.innerText.length ?? 0)
  }, [])

  React.useEffect(() => {
    const el = editorRef.current
    if (!el) return
    el.innerHTML = buildHtml(body, variableLabel)
    recalcLength()
    // Cuma dijalankan sekali saat mount — lihat catatan "uncontrolled" di atas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const insertVariable = () => {
    const el = editorRef.current
    if (!el) return
    el.focus()
    const inserted = document.execCommand("insertHTML", false, `${chipHtml(variableLabel)}&nbsp;`)
    if (!inserted) {
      el.insertAdjacentHTML("beforeend", `${chipHtml(variableLabel)}&nbsp;`)
    }
    recalcLength()
  }

  const handleSave = () => {
    const el = editorRef.current
    if (!el) return
    onSave(extractRawText(el))
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
          <button
            type="button"
            onClick={insertVariable}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-foreground"
          >
            <Plus className="h-4 w-4" />
            {variableLabel}
          </button>
        </div>
        <div className="mt-4 border-t border-zinc-200 pt-4">
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="w-full rounded-lg bg-zinc-100 py-3 text-sm font-medium text-foreground transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saveLabel}
          </button>
        </div>
      </div>

      {/* Desktop: tombol variabel terisi + ikon Check, Simpan sejajar kanan */}
      <div className="mt-3 hidden items-center justify-between gap-3 xl:flex">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={insertVariable}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Check className="h-3.5 w-3.5" />
            {variableLabel}
          </button>
        </div>
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saveLabel}
        </button>
      </div>
    </WorkspaceCard>
  )
}
