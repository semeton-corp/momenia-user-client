import { Suspense } from "react"
import { setRequestLocale } from "next-intl/server"
import AuthCallbackClient from "@/components/auth/AuthCallbackClient"

type Props = {
  params: Promise<{ locale: string }>
}

export default async function AuthCallbackPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-white px-6">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-700 border-t-transparent" />
        </main>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  )
}
