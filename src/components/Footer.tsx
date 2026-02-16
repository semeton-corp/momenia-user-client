import { getTranslations } from "next-intl/server"

export async function Footer() {
  const t = await getTranslations("footer")

  return (
    <footer className="bg-background w-full border-t py-6">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-muted-foreground text-center text-sm leading-loose md:text-left">
            {t("builtBy")}{" "}
            <a
              href="https://github.com/semeton-corp"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Semeton Corp
            </a>
            ❤️. {t("sourceCode")}{" "}
            <a
              href="https://github.com/semeton-corp/memoria-client"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              {t("github")}
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  )
}
