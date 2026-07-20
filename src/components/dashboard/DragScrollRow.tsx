"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type DragScrollRowProps = {
  /** Class untuk wrapper luar (margin/posisi). */
  className?: string
  /** Class tambahan untuk container scroll di dalam. */
  innerClassName?: string
  children: React.ReactNode
}

/**
 * Baris horizontal yang bisa digeser dengan cara DITARIK pakai mouse
 * (tanpa shift+scroll), dengan fade gradient di tepi kiri/kanan supaya
 * konten yang terpotong tidak terlihat "patah". Di layar sentuh,
 * scroll native tetap dipakai (drag hanya aktif untuk pointer mouse).
 */
export function DragScrollRow({ className, innerClassName, children }: DragScrollRowProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  // moved dipakai untuk membedakan drag vs klik — kalau sempat tergeser,
  // klik pada chip di-supress supaya tidak salah trigger filter.
  const dragState = React.useRef({ down: false, startX: 0, startScroll: 0, moved: false })

  const updateFades = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }, [])

  React.useEffect(() => {
    updateFades()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", updateFades, { passive: true })
    window.addEventListener("resize", updateFades)
    return () => {
      el.removeEventListener("scroll", updateFades)
      window.removeEventListener("resize", updateFades)
    }
  }, [updateFades, children])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return
    const el = scrollRef.current
    if (!el) return
    dragState.current = { down: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false }
    setIsDragging(true)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (!el || !dragState.current.down) return
    const dx = e.clientX - dragState.current.startX
    if (Math.abs(dx) > 4) dragState.current.moved = true
    el.scrollLeft = dragState.current.startScroll - dx
  }

  const endDrag = () => {
    dragState.current.down = false
    setIsDragging(false)
  }

  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragState.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      dragState.current.moved = false
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
        className={cn(
          "overflow-x-auto scrollbar-hide select-none",
          isDragging ? "cursor-grabbing" : "cursor-grab",
          innerClassName,
        )}
      >
        {children}
      </div>

      {/* Fade kiri/kanan — hanya tampil kalau masih ada konten tersembunyi di sisi itu */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent" />
      )}
      {canScrollRight && (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
      )}
    </div>
  )
}
