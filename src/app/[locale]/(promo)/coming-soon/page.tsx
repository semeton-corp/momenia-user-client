import { setRequestLocale } from "next-intl/server"
import { getLandingPage } from "@/lib/api/landing-page/landing-page.service"
import { PromoNavbar } from "@/components/promo/PromoNavbar"
import { PromoHeroSection } from "@/components/promo/PromoHeroSection"
import { PromoFeatureSection } from "@/components/promo/PromoFeatureSection"
import { Footer } from "@/components/Footer"

type Props = { params: Promise<{ locale: string }> }

export default async function ComingSoonPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const landingPage = await getLandingPage().catch(() => null)

  return (
    <>
      <PromoNavbar />
      <main className="flex-1 pt-16 md:pt-20">
        <PromoHeroSection />
        <PromoFeatureSection features={landingPage?.features} />
      </main>
      <Footer />
    </>
  )
}
