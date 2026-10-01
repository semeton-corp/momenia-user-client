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

// Kalau titik awal/akhir seleksi jatuh di dalam sebuah chip (mis. teks node
// "Nama Tamu" di dalam <span data-variable>), geser batas range itu ke tepat
// sebelum (start) atau sesudah (end) elemen chip-nya — supaya chip yang
// kesenggol seleksi ikut terhapus UTUH, bukan cuma sebagian teksnya yang
// terpotong (chip jadi rusak, mis. "Nama Tamu" tersisa "N" doang).
function snapBoundaryOutsideChip(root: HTMLElement, node: Node, toBeforeChip: boolean) {
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element)
  const chip = el?.closest("[data-variable]")
  if (!chip || !root.contains(chip) || !chip.parentNode) return null
  const index = Array.from(chip.parentNode.childNodes).indexOf(chip as ChildNode)
  return { node: chip.parentNode, offset: toBeforeChip ? index : index + 1 }
}

// Chip span pakai contenteditable="false" (biar tidak bisa diketik di dalamnya) —
// tapi itu bikin Backspace/Delete jadi no-op di Chrome kalau seleksinya melewati
// batas chip itu (mis. blok teks yang mencakup sebagian chip + teks di sekitarnya).
// Browser-nya sendiri menolak menghapus lintas "pulau" non-editable itu, jadi
// dihapus manual lewat Range API. Dipanggil dari onKeyDown kedua editor
// (GuestMessageTemplateCard & VariableMessageField) — return false kalau tidak
// ada seleksi (biar Backspace/Delete normal, kursor-collapsed, tetap jalan biasa).
export function deleteSelectionAcrossChips(root: HTMLElement): boolean {
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return false
  const range = selection.getRangeAt(0)
  if (!root.contains(range.commonAncestorContainer)) return false

  const startFix = snapBoundaryOutsideChip(root, range.startContainer, true)
  if (startFix) range.setStart(startFix.node, startFix.offset)
  const endFix = snapBoundaryOutsideChip(root, range.endContainer, false)
  if (endFix) range.setEnd(endFix.node, endFix.offset)

  range.deleteContents()
  selection.collapseToStart()
  return true
}
