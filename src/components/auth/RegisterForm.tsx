"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function RegisterForm() {
  const t = useTranslations("auth")
  const [isPending, setIsPending] = React.useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const password = (form.elements.namedItem("password") as HTMLInputElement).value
    const confirm = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value
    if (password !== confirm) {
      return
    }
    setIsPending(true)
    // TODO: call auth API
    setTimeout(() => setIsPending(false), 1000)
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t("registerTitle")}</h1>
        <p className="text-muted-foreground text-sm">{t("registerSubtitle")}</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="register-name">{t("name")}</Label>
          <Input id="register-name" name="name" type="text" autoComplete="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-email">{t("email")}</Label>
          <Input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-password">{t("password")}</Label>
          <Input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-confirm">{t("confirmPassword")}</Label>
          <Input
            id="register-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "..." : t("submitRegister")}
        </Button>
      </form>
      <p className="text-muted-foreground text-center text-sm">
        {t("hasAccount")}{" "}
        <Link href="/login" className="font-medium underline underline-offset-4">
          {t("goToLogin")}
        </Link>
      </p>
    </div>
  )
}
