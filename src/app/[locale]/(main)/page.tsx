import { setRequestLocale } from "next-intl/server"
import { DemoComponent } from "@/components/DemoComponent"
import OAuthHandler from "@/components/auth/OAuthHandler"

type Props = {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <OAuthHandler />
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <DemoComponent />
      </div>
    </main>
  )
}
