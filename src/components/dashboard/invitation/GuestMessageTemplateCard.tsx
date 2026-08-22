"use client"

import * as React from "react"
import { Check, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { typography } from "@/lib/typography"
import { WorkspaceCard } from "./WorkspaceCard"

export type TemplateVariable = {
  /** Nama token di raw text, mis. "guestName" → "{{guestName}}". */
  key: string
  /** Label yang tampil di tombol chip & di dalam editor. */
  label: string
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function chipHtml(variable: TemplateVariable) {
  return `<span contenteditable="false" data-variable="${variable.key}" class="mx-0.5 inline-block rounded-[4px] bg-indigo-100 px-1.5 py-0.5 align-middle text-sm font-normal text-primary xl:text-base">${escapeHtml(variable.label)}</span>`
}

// Ubah "...{{guestName}}...{{eventDate}}..." jadi HTML, tiap placeholder yang
// dikenali diganti chip berwarna dan baris baru jadi <br/> — dipakai buat isi
// awal contentEditable. Token yang tidak dikenal (bukan salah satu variables)
// dibiarkan sebagai teks biasa, bukan chip.
function buildHtml(body: string, variables: TemplateVariable[]) {
  const byKey = new Map(variables.map((v) => [v.key, v]))
  const tokenPattern = /\{\{(\w+)\}\}/g
  let html = ""
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = tokenPattern.exec(body))) {
    html += escapeHtml(body.slice(lastIndex, match.index)).replace(/\n/g, "<br/>")
    const variable = byKey.get(match[1])
    html += variable ? chipHtml(variable) : escapeHtml(match[0])
    lastIndex = tokenPattern.lastIndex
  }
  html += escapeHtml(body.slice(lastIndex)).replace(/\n/g, "<br/>")
  return html
}

// Kebalikan dari buildHtml — dipanggil saat Simpan, mengubah isi contentEditable
// (chip span + <br>/<div> dari browser) balik jadi raw text "...{{key}}...".
function nodeToRaw(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ""
  if (node.nodeType !== Node.ELEMENT_NODE) return ""
  const el = node as HTMLElement
  if (el.tagName === "BR") return "\n"
  const variableKey = el.getAttribute("data-variable")
  if (variableKey) return `{{${variableKey}}}`
  const childText = Array.from(el.childNodes).map(nodeToRaw).join("")
  return el.tagName === "DIV" || el.tagName === "P" ? `\n${childText}` : childText
}

// Buang lone surrogate (setengah pasangan UTF-16 emoji yang "putus"). Bisa
// muncul kalau execCommand("insertHTML") — API lama yang dipakai buat sisip
// chip — memecah DOM tepat di tengah emoji saat chip disisipkan berdekatan
// dengannya. Kalau lolos tersimpan, surrogate yatim itu jadi karakter �
// (replacement character) begitu di-encode ulang, mis. ke URL wa.me. Ini
// jaring pengaman terakhir sebelum raw text disimpan/dipakai.
export function stripLoneSurrogates(text: string): string {
  return text.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "")
}

function extractRawText(root: HTMLElement): string {
  const raw = Array.from(root.childNodes).map(nodeToRaw).join("")
  return stripLoneSurrogates(raw.startsWith("\n") ? raw.slice(1) : raw)
}

type GuestMessageTemplateCardProps = {
  title: string
  /** Isi awal template, placeholder ditulis sebagai {{key}} sesuai `variables`. */
  body: string
  variables: TemplateVariable[]
  helperText: string
  saveLabel: string
  onSave: (rawBody: string) => void
  /** Dipanggil kalau user menekan Simpan padahal isinya sudah melebihi maxLength. */
  onExceedsLimit?: () => void
  isSaving?: boolean
  maxLength?: number
}

/**
 * Kartu "Template Pesan Untuk Tamu" — area contentEditable dengan variabel
 * yang dirender sebagai chip berwarna inline, tombol (satu per variabel) untuk
 * menyisipkan variabel itu di posisi kursor, dan penghitung karakter.
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
  variables,
  helperText,
  saveLabel,
  onSave,
  onExceedsLimit,
  isSaving,
  maxLength = 200,
}: GuestMessageTemplateCardProps) {
  const editorRef = React.useRef<HTMLDivElement>(null)
  const [length, setLength] = React.useState(0)
  const [presentKeys, setPresentKeys] = React.useState<Set<string>>(new Set())
  const isOverLimit = length > maxLength

  // Recompute the character count AND which variable chips are currently in the
  // editor. Each button reflects that variable's own presence (filled check =
  // inserted, outline plus = absent); running this on every edit means deleting
  // a chip with the keyboard flips its button back to "+" too, not just clicking it.
  const syncState = React.useCallback(() => {
    const el = editorRef.current
    // Array.from (bukan .length mentah) supaya emoji dihitung 1 karakter, bukan
    // 2 — .length menghitung unit UTF-16, emoji astral pakai 2 unit (surrogate pair).
    setLength(Array.from(el?.innerText ?? "").length)
    const next = new Set<string>()
    variables.forEach((v) => {
      if (el?.querySelector(`[data-variable="${v.key}"]`)) next.add(v.key)
    })
    setPresentKeys(next)
  }, [variables])

  React.useEffect(() => {
    const el = editorRef.current
    if (!el) return
    el.innerHTML = buildHtml(body, variables)
    syncState()
    // Cuma dijalankan sekali saat mount — lihat catatan "uncontrolled" di atas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const insertVariable = (variable: TemplateVariable) => {
    const el = editorRef.current
    if (!el) return
    el.focus()
    const inserted = document.execCommand("insertHTML", false, `${chipHtml(variable)}&nbsp;`)
    if (!inserted) {
      el.insertAdjacentHTML("beforeend", `${chipHtml(variable)}&nbsp;`)
    }
    syncState()
  }

  const removeVariable = (variable: TemplateVariable) => {
    const el = editorRef.current
    if (!el) return
    el.querySelectorAll(`[data-variable="${variable.key}"]`).forEach((node) => node.remove())
    syncState()
  }

  // Insert the variable when it's absent, remove it when it's already present.
  const toggleVariable = (variable: TemplateVariable) => {
    if (presentKeys.has(variable.key)) removeVariable(variable)
    else insertVariable(variable)
  }

  const handleSave = () => {
    const el = editorRef.current
    if (!el) return
    // Jaga-jaga kalau tombol Simpan somehow tetap ke-trigger walau sudah
    // disabled (mis. isOverLimit berubah tepat sebelum klik diproses).
    if (isOverLimit) {
      onExceedsLimit?.()
      return
    }
    onSave(extractRawText(el))
  }

  return (
    <WorkspaceCard className="h-fit border-0 px-4 py-4 shadow-none sm:px-6 xl:border xl:p-8 xl:shadow-sm">
      <h3 className={`${typography["2xl"].semibold} text-foreground`}>{title}</h3>

      <div
        className={cn(
          "relative mt-4 rounded-lg border p-4 pb-8 sm:p-5 sm:pb-9",
          isOverLimit ? "border-red-400" : "border-zinc-200",
        )}
      >
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncState}
          role="textbox"
          aria-multiline="true"
          aria-label={title}
          className="min-h-32 whitespace-pre-wrap text-sm font-normal leading-7 text-popover-foreground outline-none sm:min-h-36 xl:text-base"
        />
        <span
          className={cn(
            "absolute bottom-3 right-4 text-sm font-normal xl:text-base",
            isOverLimit ? "font-medium text-red-500" : "text-muted-foreground",
          )}
        >
          {length}/{maxLength}
        </span>
      </div>

      <p className="mt-3 text-sm font-normal text-muted-foreground xl:text-base">{helperText}</p>

      {/* Mobile: tombol variabel outline + ikon Plus, Simpan full-width abu-abu
          di bawah, dipisah garis. Desktop pakai versi terisi (di bawah). */}
      <div className="mt-4 xl:hidden">
        <div className="flex flex-wrap gap-2">
          {variables.map((variable) => {
            const hasVariable = presentKeys.has(variable.key)
            return (
              <button
                key={variable.key}
                type="button"
                onClick={() => toggleVariable(variable)}
                aria-pressed={hasVariable}
                className={
                  hasVariable
                    ? "inline-flex items-center gap-1.5 rounded-[10px] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    : "inline-flex items-center gap-1.5 rounded-[10px] border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-zinc-50"
                }
              >
                {hasVariable ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {variable.label}
              </button>
            )
          })}
        </div>
        <div className="mt-4 border-t border-zinc-200 pt-4">
          {/* isOverLimit sengaja BUKAN pakai disabled asli — tombol native disabled
              menelan klik sepenuhnya (event tidak pernah sampai ke handler), padahal
              kita justru butuh klik itu supaya bisa munculkan toast peringatan.
              Jadi "tampak" nonaktif lewat class saja, klik tetap jalan ke handleSave
              yang mengecek isOverLimit sendiri. */}
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            aria-disabled={isOverLimit}
            className={cn(
              "w-full rounded-lg bg-zinc-100 py-3 text-sm font-medium text-foreground transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50",
              isOverLimit && "cursor-not-allowed opacity-50 hover:bg-zinc-100",
            )}
          >
            {saveLabel}
          </button>
        </div>
      </div>

      {/* Desktop: tombol variabel terisi + ikon Check, Simpan sejajar kanan */}
      <div className="mt-3 hidden items-center justify-between gap-3 xl:flex">
        <div className="flex flex-wrap gap-2">
          {variables.map((variable) => {
            const hasVariable = presentKeys.has(variable.key)
            return (
              <button
                key={variable.key}
                type="button"
                onClick={() => toggleVariable(variable)}
                aria-pressed={hasVariable}
                className={
                  hasVariable
                    ? "inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    : "inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-zinc-50"
                }
              >
                {hasVariable ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                {variable.label}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          aria-disabled={isOverLimit}
          className={cn(
            "rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50",
            isOverLimit && "cursor-not-allowed opacity-50 hover:bg-primary",
          )}
        >
          {saveLabel}
        </button>
      </div>
    </WorkspaceCard>
  )
}
