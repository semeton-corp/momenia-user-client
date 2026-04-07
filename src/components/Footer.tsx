import { getTranslations } from "next-intl/server"

export async function Footer() {
  const t = await getTranslations("footer")
  return (
    <footer className="w-full bg-[var(--chart-5)] py-8 md:py-10">
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-12">
        <p className="text-center text-sm font-semibold text-white/90 md:text-base" style={{ fontFamily: "var(--font-geist-sans)" }}>
          {t("copyright")}
        </p>
      </div>
    </footer>
  )
}
