"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { listTemplates, deleteTemplate, saveTemplate, createBlankTemplate } from "@/lib/invitation/template-store"
import type { StoredTemplate } from "@/lib/invitation/template-store"
import type { Template, SectionTypeDef } from "@/lib/invitation/types"

type ImportPayload = {
  template: Template
  sectionTypes: Record<string, SectionTypeDef>
}

export default function TemplateListClient() {
  const router = useRouter()
  const [templates, setTemplates] = useState<StoredTemplate[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [newId, setNewId] = useState("")
  const [newName, setNewName] = useState("")
  const [idError, setIdError] = useState("")
  const [importJson, setImportJson] = useState("")
  const [importError, setImportError] = useState("")
  const [importLoading, setImportLoading] = useState(false)

  useEffect(() => {
    setTemplates(listTemplates())
  }, [])

  const handleCreate = () => {
    const id = newId.trim().toLowerCase().replace(/\s+/g, "-")
    const name = newName.trim()
    if (!id) { setIdError("ID is required"); return }
    if (!/^[a-z0-9-]+$/.test(id)) { setIdError("Only lowercase letters, numbers, and hyphens"); return }
    if (templates.find((t) => t.template.id === id)) { setIdError("ID already exists"); return }
    const stored = createBlankTemplate(id, name || id)
    saveTemplate(stored.template, stored.sectionTypes)
    router.push(`/en/admin/template-maker?id=${id}`)
  }

  const handleDelete = (id: string) => {
    if (!confirm(`Delete template "${id}"? This cannot be undone.`)) return
    deleteTemplate(id)
    setTemplates(listTemplates())
  }

  const handleImport = () => {
    setImportError("")
    if (!importJson.trim()) { setImportError("JSON tidak boleh kosong"); return }

    try {
      const payload: ImportPayload = JSON.parse(importJson)

      // Validate structure
      if (!payload.template || !payload.sectionTypes) {
        setImportError("Format tidak valid. Harus memiliki 'template' dan 'sectionTypes'")
        return
      }
      if (!payload.template.id || !payload.template.name) {
        setImportError("Template harus memiliki 'id' dan 'name'")
        return
      }

      // Check if ID already exists
      if (templates.find((t) => t.template.id === payload.template.id)) {
        setImportError(`Template dengan ID "${payload.template.id}" sudah ada`)
        return
      }

      setImportLoading(true)

      // Save to localStorage
      saveTemplate(payload.template, payload.sectionTypes)

      // Update list
      setTemplates(listTemplates())
      setImportJson("")
      setShowImportModal(false)

      // Redirect to editor
      setTimeout(() => {
        router.push(`/en/admin/template-maker?id=${payload.template.id}`)
      }, 300)
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Gagal parse JSON")
    } finally {
      setImportLoading(false)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="flex h-12 items-center justify-between border-b border-gray-800 bg-gray-900 px-6">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Admin</span>
          <span className="text-gray-700">/</span>
          <span className="text-sm font-semibold text-gray-200">Templates</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowImportModal(true); setImportJson(""); setImportError("") }}
            className="flex items-center gap-2 rounded-md border border-gray-700 px-4 py-1.5 text-xs font-semibold text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4v4m0 0H8m4 0h4" />
            </svg>
            Import
          </button>
          <button
            onClick={() => { setShowModal(true); setNewId(""); setNewName(""); setIdError("") }}
            className="flex items-center gap-2 rounded-md bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Template
          </button>
        </div>
      </header>

      {/* List */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-gray-100">All Templates</h1>
          <p className="mt-0.5 text-sm text-gray-500">{templates.length} template{templates.length !== 1 ? "s" : ""}</p>
        </div>

        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 py-20 text-center">
            <p className="text-gray-500 text-sm">No templates yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-amber-500 text-sm hover:text-amber-400"
            >
              Create your first template →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map(({ template, sectionTypes, updatedAt }) => {
              const sectionCount = Object.keys(sectionTypes).length
              const pageCount = template.pages.length
              const isBuiltIn = template.id === "elegance-01"
              return (
                <div
                  key={template.id}
                  className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 px-5 py-4 hover:border-gray-700 transition-colors"
                >
                  {/* Template color swatch */}
                  <div
                    className="h-10 w-10 rounded-lg shrink-0 border border-gray-700"
                    style={{ background: template.theme_defaults.color_primary }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-100 truncate">{template.name}</span>
                      {isBuiltIn && (
                        <span className="rounded bg-gray-700 px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide shrink-0">
                          Built-in
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-[11px] text-gray-500">
                      <span className="font-mono">{template.id}</span>
                      <span>·</span>
                      <span>{pageCount} pages</span>
                      <span>·</span>
                      <span>{sectionCount} section type{sectionCount !== 1 ? "s" : ""}</span>
                      <span>·</span>
                      <span>{formatDate(updatedAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        localStorage.setItem("selected_template_id", template.id)
                        router.push("/en/edit")
                      }}
                      className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 transition-colors"
                    >
                      Use Template
                    </button>
                    <button
                      onClick={() => router.push(`/en/admin/template-maker?id=${template.id}`)}
                      className="rounded-md border border-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        const json = JSON.stringify({ template, sectionTypes }, null, 2)
                        const blob = new Blob([json], { type: "application/json" })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = `${template.id}.json`
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="rounded-md border border-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      Export
                    </button>
                    {!isBuiltIn && (
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="rounded-md border border-red-900/50 px-3 py-1.5 text-xs text-red-400 hover:bg-red-900/30 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* New Template Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
            <h2 className="mb-4 text-base font-semibold text-gray-100">New Template</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Template Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Modern Minimalist"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:border-amber-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  Template ID <span className="text-gray-600">(unique, no spaces)</span>
                </label>
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => { setNewId(e.target.value); setIdError("") }}
                  placeholder="e.g. modern-minimalist-01"
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 bg-gray-800 focus:outline-none ${
                    idError ? "border-red-500 focus:border-red-500" : "border-gray-700 focus:border-amber-500"
                  }`}
                />
                {idError && <p className="mt-1 text-xs text-red-400">{idError}</p>}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-lg border border-gray-700 py-2 text-sm text-gray-400 hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 rounded-lg bg-amber-600 py-2 text-sm font-semibold text-white hover:bg-amber-500 transition-colors"
              >
                Create & Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-base font-semibold text-gray-100">Import Template</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-400">
                  Paste Template JSON
                </label>
                <textarea
                  value={importJson}
                  onChange={(e) => { setImportJson(e.target.value); setImportError("") }}
                  placeholder={`{\n  "template": { ... },\n  "sectionTypes": { ... }\n}`}
                  spellCheck={false}
                  className="w-full h-56 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>

              {importError && (
                <div className="rounded-lg border border-red-900/50 bg-red-900/20 p-3">
                  <p className="text-xs text-red-400">{importError}</p>
                </div>
              )}

              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-400 font-mono">Format JSON:</p>
                <pre className="text-[10px] text-gray-500 mt-2 overflow-x-auto">{`{
  "template": {
    "id": "template-id",
    "name": "Template Name",
    "theme_defaults": { ... },
    "pages": [ ... ],
    "schema": { ... }
  },
  "sectionTypes": {
    "section_id": { ... }
  }
}`}</pre>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 rounded-lg border border-gray-700 py-2 text-sm text-gray-400 hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importLoading}
                className="flex-1 rounded-lg bg-amber-600 py-2 text-sm font-semibold text-white hover:bg-amber-500 transition-colors disabled:opacity-60"
              >
                {importLoading ? "Importing..." : "Import & Edit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
