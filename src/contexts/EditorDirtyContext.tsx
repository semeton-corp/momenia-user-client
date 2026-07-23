"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type EditorDirtyContextValue = {
  isDirty: boolean
  setIsDirty: (dirty: boolean) => void
}

const EditorDirtyContext = createContext<EditorDirtyContextValue | null>(null)

export function EditorDirtyProvider({ children }: { children: ReactNode }) {
  const [isDirty, setIsDirty] = useState(false)
  return (
    <EditorDirtyContext.Provider value={{ isDirty, setIsDirty }}>
      {children}
    </EditorDirtyContext.Provider>
  )
}

export function useEditorDirty() {
  const ctx = useContext(EditorDirtyContext)
  if (!ctx) return { isDirty: false, setIsDirty: () => {} }
  return ctx
}
