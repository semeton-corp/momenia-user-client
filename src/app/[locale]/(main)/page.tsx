import { setRequestLocale, getTranslations } from "next-intl/server"
import { FeatureSection } from "@/components/landing/FeatureSection"
import { HeroSection } from "@/components/landing/HeroSection"
import { AboutSection } from "@/components/landing/AboutSection"
import { CatalogSection } from "@/components/landing/CatalogSection"
import { CreateNowBanner } from "@/components/landing/CreateNowBanner"
import { FaqSection } from "@/components/landing/FaqSection"
import { TestimonialSection } from "@/components/landing/TestimonialSection"
import OAuthHandler from "@/components/auth/OAuthHandler"
import { getLandingPage } from "@/lib/api/landing-page/landing-page.service"

type Props = {
  readonly params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const landingPage = await getLandingPage().catch(() => null)

  if (process.env.PROMOTIONAL_PAGE === "true") {
    const tPromo = await getTranslations("promo")
    const tCommon = await getTranslations("common")
    const siteName = tCommon("siteName").toUpperCase()

    return (
      <>
        <HeroSection
          promoContent={{
            badge: tPromo("hero.badge"),
            title: siteName,
            subtitle: tPromo("hero.subtitle"),
          }}
        />
        <div className="mt-16 md:mt-24">
          <FeatureSection
            features={landingPage?.features}
            locale={locale}
            promoTitle={{
              badge: tPromo("features.badge"),
              title: siteName,
              subtitle: tPromo("features.subtitle"),
            }}
          />
        </div>
      </>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 pb-12">
      <HeroSection />
      <div className="relative isolate w-full overflow-hidden -mt-8 md:-mt-14">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-262.5 w-262.5 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px] opacity-32 md:h-375 md:w-375 md:blur-[185px] lg:h-462.5 lg:w-462.5 lg:blur-[220px] xl:h-537.5 xl:w-537.5 xl:blur-[245px]"
          style={{
            background: "radial-gradient(circle, var(--hero-bg-indigo-600) 0%, transparent 70%)",
          }}
        />
        <div className="relative flex flex-col items-center gap-8">
          <AboutSection />
          <FeatureSection features={landingPage?.features} locale={locale} />
          <CatalogSection catalogs={landingPage?.catalogs} />
        </div>
      </div>
      <CreateNowBanner />
      <TestimonialSection testimonials={landingPage?.testimonials} locale={locale} />
      <FaqSection faqs={landingPage?.faqs} locale={locale} />
    </main>
  )
}
