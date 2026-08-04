"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronDown, ListPlus, PencilLine, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { GuestInvitationCategory } from "@/lib/api/guest-invitation-category/guest-invitation-category.types"
import { DeleteCategoryConfirmDialog } from "./DeleteCategoryConfirmDialog"

type CategoryManagerSelectProps = {
  placeholder: string
  hint: string
  value: string | null
  onChange: (value: string) => void
  categories: GuestInvitationCategory[]
  disabled?: boolean
  error?: string
  addCategoryLabel: string
  newCategoryPlaceholder: string
  isCreating?: boolean
  onCreate: (name: string) => void
  isUpdating?: boolean
  onUpdate: (id: string, name: string) => void
  isDeleting?: boolean
  onDelete: (id: string) => void
}

export function CategoryManagerSelect({
  placeholder,
  hint,
  value,
  onChange,
  categories,
  disabled,
  error,
  addCategoryLabel,
  newCategoryPlaceholder,
  isCreating,
  onCreate,
  isUpdating,
  onUpdate,
  isDeleting,
  onDelete,
}: CategoryManagerSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [isAdding, setIsAdding] = React.useState(false)
  const [newName, setNewName] = React.useState("")
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editingName, setEditingName] = React.useState("")
  const [pendingDelete, setPendingDelete] = React.useState<GuestInvitationCategory | null>(null)
  const ref = React.useRef<HTMLDivElement>(null)

  const selected = categories.find((c) => c.id === value) ?? null

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setIsAdding(false)
        setNewName("")
        setEditingId(null)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const choose = (category: GuestInvitationCategory) => {
    onChange(category.id)
    setOpen(false)
  }

  const startEditing = (e: React.MouseEvent, category: GuestInvitationCategory) => {
    e.stopPropagation()
    setEditingId(category.id)
    setEditingName(category.name)
  }

  const cancelEditing = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditingId(null)
    setEditingName("")
  }

  const submitEditing = (e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const trimmed = editingName.trim()
    if (trimmed && editingId) onUpdate(editingId, trimmed)
    setEditingId(null)
  }

  const requestDelete = (e: React.MouseEvent, category: GuestInvitationCategory) => {
    e.stopPropagation()
    setPendingDelete(category)
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    onDelete(pendingDelete.id)
    setPendingDelete(null)
  }

  const submitNewCategory = (e?: React.SyntheticEvent) => {
    e?.stopPropagation()
    const trimmed = newName.trim()
    if (trimmed) onCreate(trimmed)
    setNewName("")
    setIsAdding(false)
  }

  return (
    <div className="space-y-1.5">
      <div ref={ref} className="relative">
        {/* Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-xl border bg-white px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60",
            open ? "border-indigo-400 ring-2 ring-indigo-100" : error ? "border-red-300" : "border-zinc-200",
            selected ? "text-zinc-800" : "text-zinc-400"
          )}
        >
          <span className="truncate">{selected ? selected.name : placeholder}</span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
          </motion.span>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-md"
            >
              <div className="max-h-64 overflow-y-auto py-1.5">
                {categories.map((category) => {
                  const isActive = value === category.id
                  const isRowEditing = editingId === category.id
                  return (
                    <div
                      key={category.id}
                      onClick={() => !isRowEditing && choose(category)}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm transition-colors",
                        isActive && !isRowEditing ? "bg-indigo-500 text-white" : "text-zinc-700 hover:bg-zinc-50"
                      )}
                    >
                      {isRowEditing ? (
                        <>
                          <input
                            autoFocus
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") submitEditing(e)
                              if (e.key === "Escape") cancelEditing()
                            }}
                            className="min-w-0 flex-1 rounded-md border border-indigo-300 px-2 py-1 text-sm text-zinc-800 outline-none"
                          />
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={submitEditing}
                            className="shrink-0 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="shrink-0 text-zinc-400 hover:text-zinc-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {isActive && <Check className="h-4 w-4 shrink-0" />}
                          <span className="min-w-0 flex-1 truncate">{category.name}</span>
                          <button
                            type="button"
                            onClick={(e) => startEditing(e, category)}
                            className={cn(
                              "shrink-0 transition-colors",
                              isActive ? "text-white/80 hover:text-white" : "text-zinc-400 hover:text-indigo-500"
                            )}
                          >
                            <PencilLine className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => requestDelete(e, category)}
                            className={cn(
                              "shrink-0 transition-colors",
                              isActive ? "text-white/80 hover:text-white" : "text-zinc-400 hover:text-red-500"
                            )}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Tambah Kategori */}
              <div className="border-t border-zinc-100 p-2">
                {isAdding ? (
                  // div, bukan <form> — komponen ini dipakai di dalam <form> milik GuestAddForm,
                  // dan HTML tidak mengizinkan <form> bersarang di dalam <form>.
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder={newCategoryPlaceholder}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") submitNewCategory(e)
                        if (e.key === "Escape") {
                          setIsAdding(false)
                          setNewName("")
                        }
                      }}
                      className="min-w-0 flex-1 rounded-md border border-indigo-300 px-2 py-1.5 text-sm text-zinc-800 outline-none"
                    />
                    <button
                      type="button"
                      disabled={isCreating}
                      onClick={submitNewCategory}
                      className="shrink-0 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdding(false)
                        setNewName("")
                      }}
                      className="shrink-0 text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsAdding(true)
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 py-2.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50"
                  >
                    <ListPlus className="h-4 w-4" />
                    {addCategoryLabel}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error ? <p className="text-xs text-red-500">{error}</p> : <p className="text-xs text-zinc-400">{hint}</p>}

      <DeleteCategoryConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(next) => !next && setPendingDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        categoryName={pendingDelete?.name}
      />
    </div>
  )
}
