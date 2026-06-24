"use client"

import dynamic from "next/dynamic"

const Navbar = dynamic(
  () => import("@/components/Navbar").then((m) => ({ default: m.Navbar })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-x-0 top-0 z-[100] h-16 border-b border-border/70 bg-white lg:h-20" />
    ),
  }
)

export function NavbarClient() {
  return <Navbar />
}
