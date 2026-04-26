import { Skeleton } from "@/components/ui/skeleton"

export function CatalogSkeleton() {
  return (
    <section className="relative mx-auto w-full max-w-400 overflow-hidden px-4 pt-3 pb-4 md:px-12 md:pt-6 md:pb-8 lg:pt-6 lg:pb-8">
      <div className="flex flex-col items-center gap-6 pb-10 pt-16 md:pb-12 md:pt-16 lg:pb-12 lg:pt-24">

        {/* Section header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Skeleton className="h-9 w-50 md:h-11 md:w-70 lg:w-80" />
          <Skeleton className="h-4 w-60 md:h-5 md:w-90" />
          <Skeleton className="h-4 w-50 md:h-5 md:w-75" />
        </div>

        {/* Phone mockup carousel */}
        <div className="flex items-end justify-center gap-4 md:gap-6">
          <Skeleton className="hidden h-90 w-25 rounded-3xl sm:block md:h-125" />
          <Skeleton className="h-95 w-44 rounded-4xl md:h-135 md:w-60" />
          <Skeleton className="hidden h-90 w-25 rounded-3xl sm:block md:h-125" />
        </div>

        {/* Nav + CTA */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full md:h-12 md:w-12" />
            <Skeleton className="h-10 w-10 rounded-full md:h-12 md:w-12" />
          </div>
          <Skeleton className="h-12 w-75 rounded-xl md:w-87.5" />
        </div>

      </div>
    </section>
  )
}
