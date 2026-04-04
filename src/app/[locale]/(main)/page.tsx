import { setRequestLocale } from "next-intl/server"
import { FeatureSection } from "@/components/landing/FeatureSection"
import { HeroSection } from "@/components/landing/HeroSection"
import { AboutSection } from "@/components/landing/AboutSection"

import { CatalogSection } from "@/components/landing/CatalogSection"
import { CreateNowBanner } from "@/components/landing/CreateNowBanner"
import { FaqSection } from "@/components/landing/FaqSection"
import { TestimonialSection } from "@/components/landing/TestimonialSection"

type Props = {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 pb-12">
      <HeroSection />
      <div className="relative isolate w-full overflow-hidden">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[1050px] w-[1050px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px] opacity-32 md:h-[1500px] md:w-[1500px] md:blur-[185px] lg:h-[1850px] lg:w-[1850px] lg:blur-[220px] xl:h-[2150px] xl:w-[2150px] xl:blur-[245px]"
          style={{
            background: "radial-gradient(circle, var(--hero-bg-indigo-600) 0%, transparent 70%)",
          }}
        />
        <div className="relative flex flex-col items-center gap-8">
          <AboutSection />
          <FeatureSection />
          <CatalogSection />
        </div>
      </div>
      <CreateNowBanner />
      <TestimonialSection />
      <FaqSection />
    </main>
  )
}
