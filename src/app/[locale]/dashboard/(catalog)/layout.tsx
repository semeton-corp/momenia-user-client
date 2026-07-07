"use client"

import * as React from "react"
import { DashboardAuthGateProvider } from "@/components/dashboard/DashboardAuthGate"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { DashboardMobileHeader } from "@/components/dashboard/DashboardMobileHeader"
import { DashboardMobileNav } from "@/components/dashboard/DashboardMobileNav"
import { useZoomScale } from "@/hooks/use-zoom-scale"

type Props = {
  readonly children: React.ReactNode
}

export default function DashboardLayout({ children }: Props) {
  const scale = useZoomScale()

  return (
    <div style={{ zoom: scale } as React.CSSProperties}>
      <DashboardAuthGateProvider>
        <div className="flex min-h-screen bg-white">
          <DashboardSidebar />
          <main className="flex-1 overflow-y-auto pb-28 xl:ml-24 xl:pb-0 [scrollbar-gutter:stable_both-edges]">
            <DashboardMobileHeader />
            {children}
          </main>
        </div>
        <DashboardMobileNav />
      </DashboardAuthGateProvider>
    </div>
  )
}
