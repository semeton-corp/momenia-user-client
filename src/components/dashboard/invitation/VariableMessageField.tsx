"use client"

import * as React from "react"
import { Check, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildHtml, chipHtml, extractRawText, type TemplateVariable } from "@/lib/template-editor"

export type VariableMessageFieldHandle = {
  /** Baca isi editor sekarang jadi raw text "...{{key}}..." — dipanggil saat Simpan. */
  getRawText: () => string
}

type VariableMessageFieldProps = {
  /** Isi awal, placeholder ditulis sebagai {{key}} sesuai `variables`. */
  body: string
  variables: TemplateVariable[]
  ariaLabel: string
  placeholder?: string
  className?: string
}

/**
 * Versi ringan dari GuestMessageTemplateCard — cuma area contentEditable +
 * tombol chip variabel, TANPA kartu/judul/tombol-Simpan sendiri, supaya bisa
 * ditempel di dalam form yang lebih besar (mis. "Create Notes" yang punya
 * field lain + satu tombol Simpan bersama). Nilai dibaca lewat ref
 * (`getRawText`) saat parent-nya menekan Simpan, bukan lewat state yang
 * disinkron tiap ketikan — sama seperti GuestMessageTemplateCard, supaya
 * React tidak ikut campur mencocokkan ulang DOM contentEditable saat mengetik.
 */
export const VariableMessageField = React.forwardRef<VariableMessageFieldHandle, VariableMessageFieldProps>(
  function VariableMessageField({ body, variables, ariaLabel, placeholder, className }, ref) {
    const editorRef = React.useRef<HTMLDivElement>(null)
    const [presentKeys, setPresentKeys] = React.useState<Set<string>>(new Set())

    const syncState = React.useCallback(() => {
      const el = editorRef.current
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
      // Cuma dijalankan sekali saat mount — konten uncontrolled, lihat catatan di atas.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    React.useImperativeHandle(ref, () => ({
      getRawText: () => (editorRef.current ? extractRawText(editorRef.current) : ""),
    }))

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

    const toggleVariable = (variable: TemplateVariable) => {
      if (presentKeys.has(variable.key)) removeVariable(variable)
      else insertVariable(variable)
    }

    return (
      <div className="space-y-2">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncState}
          role="textbox"
          aria-multiline="true"
          aria-label={ariaLabel}
          data-placeholder={placeholder}
          className={cn(
            "min-h-28 w-full resize-none whitespace-pre-wrap rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 empty:before:text-zinc-400 empty:before:content-[attr(data-placeholder)]",
            className,
          )}
        />
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
                    ? "inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    : "inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-zinc-50"
                }
              >
                {hasVariable ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                {variable.label}
              </button>
            )
          })}
        </div>
      </div>
    )
  },
)
