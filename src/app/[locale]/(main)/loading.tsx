import { HeroSkeleton } from "@/components/landing/skeletons/HeroSkeleton"
import { FeatureSkeleton } from "@/components/landing/skeletons/FeatureSkeleton"
import { CatalogSkeleton } from "@/components/landing/skeletons/CatalogSkeleton"
import { TestimonialSkeleton } from "@/components/landing/skeletons/TestimonialSkeleton"
import { FaqSkeleton } from "@/components/landing/skeletons/FaqSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function LandingPageLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-8 pb-12">
      <HeroSkeleton />

      <div className="relative isolate w-full overflow-hidden">
        <div className="relative flex flex-col items-center gap-8">
          {/* AboutSection is fully static — no skeleton needed */}
          <div className="h-40 w-full" />
          <FeatureSkeleton />
          <CatalogSkeleton />
        </div>
      </div>

      <TestimonialSkeleton />
      <FaqSkeleton />

      {/* CreateNowBanner is fully static — placeholder height only */}
      <Skeleton className="h-32 w-full max-w-400 rounded-2xl md:h-40" />
    </main>
  )
}
