import { getTranslations, setRequestLocale } from "next-intl/server"
import { LegalDocument, type LegalSection } from "@/components/legal/LegalDocument"

type Props = {
  params: Promise<{ locale: string }>
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations("legal.privacy")
  const sections = t.raw("sections") as LegalSection[]

  return <LegalDocument title={t("title")} sections={sections} />
}
