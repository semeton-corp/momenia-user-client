"use client"

import * as React from "react"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { useZoomScale } from "@/hooks/use-zoom-scale"

type Props = {
  readonly children: React.ReactNode
}

export default function DashboardLayout({ children }: Props) {
  const scale = useZoomScale()

  return (
    <div style={{ zoom: scale } as React.CSSProperties}>
      <div className="flex min-h-screen bg-zinc-50">
        <DashboardSidebar />
        <main className="ml-24 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
