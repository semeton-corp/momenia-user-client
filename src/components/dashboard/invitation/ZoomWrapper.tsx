"use client"

import * as React from "react"
import { useZoomScale } from "@/hooks/use-zoom-scale"

export function ZoomWrapper({ children }: { children: React.ReactNode }) {
  const scale = useZoomScale()
  return (
    <div style={{ zoom: scale } as React.CSSProperties}>
      {children}
    </div>
  )
}
