"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const t = useTranslations("auth")
  const [isPending, setIsPending] = React.useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    // TODO: call auth API
    setTimeout(() => setIsPending(false), 1000)
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t("loginTitle")}</h1>
        <p className="text-muted-foreground text-sm">{t("loginSubtitle")}</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="login-email">{t("email")}</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password">{t("password")}</Label>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "..." : t("submitLogin")}
        </Button>
      </form>
      <p className="text-muted-foreground text-center text-sm">
        {t("noAccount")}{" "}
        <Link href="/register" className="font-medium underline underline-offset-4">
          {t("goToRegister")}
        </Link>
      </p>
    </div>
  )
}
