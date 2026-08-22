// Utilities bersama untuk editor template ber-variabel (contentEditable dengan
// chip berwarna, mis. {{guestName}}) — dipakai baik di GuestMessageTemplateCard
// (halaman Guests) maupun VariableMessageField (halaman Notes), supaya perilaku
// insert/simpan/sanitasinya konsisten dan tidak diduplikasi.

export type TemplateVariable = {
  /** Nama token di raw text, mis. "guestName" → "{{guestName}}". */
  key: string
  /** Label yang tampil di tombol chip & di dalam editor. */
  label: string
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

export function chipHtml(variable: TemplateVariable): string {
  return `<span contenteditable="false" data-variable="${variable.key}" class="mx-0.5 inline-block rounded-[4px] bg-indigo-100 px-1.5 py-0.5 align-middle text-sm font-normal text-primary xl:text-base">${escapeHtml(variable.label)}</span>`
}

// Ubah "...{{guestName}}...{{eventDate}}..." jadi HTML, tiap placeholder yang
// dikenali diganti chip berwarna dan baris baru jadi <br/> — dipakai buat isi
// awal contentEditable. Token yang tidak dikenal (bukan salah satu variables)
// dibiarkan sebagai teks biasa, bukan chip.
export function buildHtml(body: string, variables: TemplateVariable[]): string {
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
export function nodeToRaw(node: ChildNode): string {
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

export function extractRawText(root: HTMLElement): string {
  const raw = Array.from(root.childNodes).map(nodeToRaw).join("")
  return stripLoneSurrogates(raw.startsWith("\n") ? raw.slice(1) : raw)
}
