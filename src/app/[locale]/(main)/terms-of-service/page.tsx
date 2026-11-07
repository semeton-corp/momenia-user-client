import { getTranslations, setRequestLocale } from "next-intl/server"
import { LegalDocument, type LegalSection } from "@/components/legal/LegalDocument"

type Props = {
  params: Promise<{ locale: string }>
}

export default async function TermsOfServicePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const tLegal = await getTranslations("legal.terms")
  const tPayment = await getTranslations("dashboard.payment")
  const sections = tPayment.raw("termsSections") as LegalSection[]

  return (
    <LegalDocument
      title={tLegal("title")}
      lastUpdated={tPayment("termsLastUpdated")}
      sections={sections}
    />
  )
}
