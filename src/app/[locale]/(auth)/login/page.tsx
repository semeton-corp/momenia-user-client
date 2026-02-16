import { setRequestLocale } from "next-intl/server"
import { LoginForm } from "@/components/auth/LoginForm"

type Props = {
  params: Promise<{ locale: string }>
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="border-border bg-card text-card-foreground w-full max-w-md rounded-lg border p-8 shadow-sm">
        <LoginForm />
      </div>
    </main>
  )
}
