import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import "./globals.css"
import QueryProvider from "@/providers/QueryProvider"
import ToastProvider from "@/providers/ToastProvider"

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Momenia",
  description: "Momenia",
  // Served as a plain static asset (public/icon.svg) rather than the app/icon.svg
  // file-convention — Next.js's webpack build (needed for the Cloudflare/OpenNext
  // deploy, since Turbopack's own middleware trace output isn't what OpenNext reads)
  // has a bug where its metadata-image loader can't process SVG icons and crashes
  // the whole build. This sidesteps that pipeline entirely; same icon, no bug.
  icons: {
    icon: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        <QueryProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
