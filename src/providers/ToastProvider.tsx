"use client"

import { createContext, useCallback, useContext, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, XCircle, Info, X } from "lucide-react"

type ToastType = "success" | "error" | "info"
type Toast = { id: number; type: ToastType; message: string }

type ToastContextValue = {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

const ICONS = {
  success: <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />,
  error: <XCircle className="h-5 w-5 shrink-0 text-red-500" />,
  info: <Info className="h-5 w-5 shrink-0 text-indigo-500" />,
}

// Collapsed-stack geometry (Sonner-style)
const GAP = 14              // px gap between toasts when expanded
const COLLAPSED_OFFSET = 16 // px peek of each stacked toast when collapsed
const SCALE_STEP = 0.05     // how much each toast behind shrinks
const MAX_VISIBLE = 3       // toasts that stay fully visible before the stack fades

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [expanded, setExpanded] = useState(false)
  const [heights, setHeights] = useState<Record<number, number>>({})

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    setHeights((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => remove(id), 4000)
  }, [remove])

  // newest toast sits in front (index 0 from the front)
  const ordered = [...toasts].reverse()

  const measuredHeight = (id: number) => heights[id] ?? 60

  // cumulative offset of stacked toasts above `frontIndex` when expanded
  const expandedOffset = (frontIndex: number) => {
    let offset = 0
    for (let i = 0; i < frontIndex; i++) {
      offset += measuredHeight(ordered[i].id) + GAP
    }
    return offset
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-[100] w-[360px] max-w-[calc(100vw-2.5rem)]"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{ height: 0 }}
      >
        <AnimatePresence>
          {ordered.map((t, frontIndex) => {
            const y = expanded
              ? -expandedOffset(frontIndex)
              : -frontIndex * COLLAPSED_OFFSET
            const scale = expanded ? 1 : 1 - frontIndex * SCALE_STEP
            const opacity = frontIndex >= MAX_VISIBLE && !expanded ? 0 : 1

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ y: 24, opacity: 0, scale: 0.9 }}
                animate={{ y, scale, opacity }}
                exit={{ y: 24, opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 34, mass: 0.8 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0, right: 0.9 }}
                onDragEnd={(_, info) => { if (info.offset.x > 80) remove(t.id) }}
                style={{ position: "absolute", bottom: 0, right: 0, transformOrigin: "bottom center", zIndex: 100 - frontIndex }}
                className="w-full"
              >
                <div
                  ref={(el) => {
                    if (el) {
                      const h = el.offsetHeight
                      setHeights((prev) => (prev[t.id] === h ? prev : { ...prev, [t.id]: h }))
                    }
                  }}
                  className="flex cursor-grab items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 shadow-lg active:cursor-grabbing"
                >
                  {ICONS[t.type]}
                  <p className="flex-1 text-sm font-medium text-zinc-800">{t.message}</p>
                  <button onClick={() => remove(t.id)} className="text-zinc-400 transition-colors hover:text-zinc-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
