import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["id", "en", "ja"],
  defaultLocale: "en",
  localePrefix: "always",
})
